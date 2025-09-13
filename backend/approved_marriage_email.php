<?php
// Prevent any output before JSON response
ob_start();

// Enable error logging but disable displaying errors
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include PHPMailer early
require_once $_SERVER['DOCUMENT_ROOT'] . '/PHPMailer-master/src/Exception.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/PHPMailer-master/src/PHPMailer.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/PHPMailer-master/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Function to handle errors and return JSON response
function handleError($message, $errorDetails = null) {
    ob_clean(); // Clear any output
    $response = [
        "success" => false,
        "message" => $message
    ];
    
    if ($errorDetails && getenv('APP_ENV') !== 'production') {
        $response["details"] = $errorDetails;
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

// Respond to preflight (OPTIONS) request and exit
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

try {
    // Database connection
    $servername = "localhost";
    $username = "u572625467_divine_mercy";
    $password = "Parish_12345";
    $dbname = "u572625467_parish";
    
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        handleError("Database connection failed: " . $conn->connect_error);
    }
    
    // Default response
    $response = [
        "success" => false,
        "message" => "Unknown error occurred"
    ];
    
    // Log function for debugging
    function logError($message) {
        error_log("[MARRIAGE_EMAIL_ERROR] " . $message);
    }
    
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Get and parse JSON data
        $jsonData = file_get_contents("php://input");
        $data = json_decode($jsonData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            handleError("Invalid JSON format: " . json_last_error_msg());
        }
    
        // Log received data for debugging
        error_log("Received marriage approval email request: " . $jsonData);
    
        // Validate input data
        if (!isset($data['marriageID']) || empty($data['marriageID'])) {
            handleError("Marriage ID is required");
        }
        
        $marriageID = $data['marriageID'];
        $date = isset($data['date']) ? $data['date'] : null;
        $time = isset($data['time']) ? $data['time'] : null;
        $priest = isset($data['priest']) ? $data['priest'] : null;
        
        // Get the client ID associated with the marriage
        $stmt = $conn->prepare("SELECT clientID FROM marriage_application WHERE marriageID = ?");
        if (!$stmt) {
            handleError("Prepare statement failed", $conn->error);
        }
        
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows == 0) {
            handleError("No marriage record found with ID: " . $marriageID);
        }
        
        $marriageInfo = $result->fetch_assoc();
        $clientID = $marriageInfo['clientID'];
        
        // Now, get the client's email from client_registration table
        $stmt = $conn->prepare("SELECT email, first_name, last_name FROM client_registration WHERE clientID = ?");
        if (!$stmt) {
            handleError("Prepare statement failed", $conn->error);
        }
        
        $stmt->bind_param("i", $clientID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows == 0) {
            handleError("Client profile not found for ID: " . $clientID);
        }
        
        $clientInfo = $result->fetch_assoc();
        $userEmail = $clientInfo['email'];
        $firstName = $clientInfo['first_name'];
        $lastName = $clientInfo['last_name'];
        $fullName = $firstName . ' ' . $lastName;
        
        error_log('[MARRIAGE_EMAIL] Preparing to send approval email to: ' . $userEmail . ' (' . $fullName . ')');

        // Get the marriage details
        $stmt = $conn->prepare("
            SELECT m.groom_first_name, m.groom_middle_name, m.groom_last_name, 
                  m.bride_first_name, m.bride_middle_name, m.bride_last_name
            FROM marriage_application m 
            WHERE m.marriageID = ?");
        if (!$stmt) {
            handleError("Prepare statement failed", $conn->error);
        }
        
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $marriageResult = $stmt->get_result();
        
        if ($marriageResult->num_rows == 0) {
            handleError("Marriage details not found for ID: " . $marriageID);
        }
        
        $marriageData = $marriageResult->fetch_assoc();
        
        // If date, time, or priest is not provided in the POST data, fetch from approved_appointments
        if (!$date || !$time || !$priest) {
            $stmt = $conn->prepare("
                SELECT date, time, priest 
                FROM approved_appointments 
                WHERE sacramentID = ? AND sacrament_type = 'Marriage'");
            if (!$stmt) {
                handleError("Prepare statement failed", $conn->error);
            }
            
            $stmt->bind_param("i", $marriageID);
            $stmt->execute();
            $appointmentResult = $stmt->get_result();
            
            if ($appointmentResult->num_rows > 0) {
                $appointmentData = $appointmentResult->fetch_assoc();
                
                // Only use these values if they weren't provided in the POST data
                $date = $date ?: $appointmentData['date'];
                $time = $time ?: $appointmentData['time'];
                $priest = $priest ?: $appointmentData['priest'];
            } else {
                // If no data in approved_appointments, fallback to marriage_application
                $stmt = $conn->prepare("
                    SELECT date, time, priest 
                    FROM marriage_application 
                    WHERE marriageID = ?");
                if (!$stmt) {
                    handleError("Prepare statement failed", $conn->error);
                }
                
                $stmt->bind_param("i", $marriageID);
                $stmt->execute();
                $fallbackResult = $stmt->get_result();
                
                if ($fallbackResult->num_rows > 0) {
                    $fallbackData = $fallbackResult->fetch_assoc();
                    
                    // Use fallback values only if not provided earlier
                    $date = $date ?: $fallbackData['date'];
                    $time = $time ?: $fallbackData['time'];
                    $priest = $priest ?: $fallbackData['priest'];
                }
            }
        }
        
        // Create new PHPMailer instance
        $mail = new PHPMailer(true);

        try {
            error_log('[MARRIAGE_EMAIL] Configuring PHPMailer...');
            // Server settings
            $mail->SMTPDebug = 2;
            $mail->Debugoutput = function($str, $level) { error_log('PHPMailer: ' . $str); };
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'parishofdivinemercy@gmail.com';
            $mail->Password   = 'obyk hxts jdsv lofs'; // Your App Password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            error_log('[MARRIAGE_EMAIL] Setting From/To...');
            $mail->setFrom('parishofdivinemercy@gmail.com', 'Parish of Divine Mercy');
            $mail->addAddress($userEmail, $fullName);

            // CORRECTED: Format the date for display (December 23, 2025 format)
            $marriageDate = isset($date) ? date('F j, Y', strtotime($date)) : '';
            
            // CORRECTED: Format time to 12-hour format with AM/PM (3:00 PM format)
            $marriageTime = '';
            if (isset($time) && !empty($time)) {
                // Convert 24-hour format to 12-hour format with AM/PM
                $timeObj = DateTime::createFromFormat('H:i:s', $time);
                if ($timeObj) {
                    $marriageTime = $timeObj->format('g:i A'); // e.g., "3:00 PM"
                } else {
                    // Fallback: try without seconds
                    $timeObj = DateTime::createFromFormat('H:i', $time);
                    if ($timeObj) {
                        $marriageTime = $timeObj->format('g:i A');
                    } else {
                        $marriageTime = $time; // Use original if conversion fails
                    }
                }
            }
            
            $priestName = isset($priest) ? $priest : '';
            
            $groomName = trim(($marriageData['groom_first_name'] ?? '') . ' ' . 
                       ($marriageData['groom_middle_name'] ?? '') . ' ' . 
                       ($marriageData['groom_last_name'] ?? ''));
            
            $brideName = trim(($marriageData['bride_first_name'] ?? '') . ' ' . 
                       ($marriageData['bride_middle_name'] ?? '') . ' ' . 
                       ($marriageData['bride_last_name'] ?? ''));

            // Email content with matching color scheme - UPDATED MESSAGING
            $mail->isHTML(true);
            $mail->Subject = 'Marriage Application APPROVED - Parish of Divine Mercy';
            $mail->Body = "
                <html>
                <body style='font-family: Roboto, Arial, sans-serif; line-height: 1.6; color: #000; margin: 0; padding: 0;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>
                        <div style='background-color: #573901; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;'>
                            <h1 style='color: white; margin: 0; font-family: Montserrat, sans-serif; font-size: 24px; letter-spacing: 1px;'>Parish of Divine Mercy</h1>
                        </div>
                        
                        <div style='background: linear-gradient(to right, #710808, #ffcccc); height: 4px; width: 100%;'></div>
                        
                        <div style='padding: 30px 20px; background-color: #fff;'>
                            <h2 style='color: #573901; font-family: Montserrat, sans-serif; margin-bottom: 20px;'>Dear {$fullName},</h2>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>We are pleased to inform you that your <b>Marriage Application</b> for the Parish of Divine Mercy has been <strong style='color: #28a745;'>APPROVED</strong>!</p>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>Your wedding ceremony has been scheduled for the date and time indicated below:</p>
                            
                            <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;'>
                                <h3 style='color: #573901; font-family: Montserrat, sans-serif; margin-top: 0; font-size: 18px;'>Wedding Ceremony Details:</h3>
                                <table style='width: 100%; font-family: Roboto, sans-serif; color: #000;'>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Groom:</td>
                                        <td style='padding: 8px 0;'>{$groomName}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Bride:</td>
                                        <td style='padding: 8px 0;'>{$brideName}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Wedding Date:</td>
                                        <td style='padding: 8px 0;'><strong>{$marriageDate}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Wedding Time:</td>
                                        <td style='padding: 8px 0;'><strong>{$marriageTime}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Officiating Priest:</td>
                                        <td style='padding: 8px 0;'>{$priestName}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Location:</td>
                                        <td style='padding: 8px 0;'>Parish of Divine Mercy, Alawihao, Daet</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Status:</td>
                                        <td style='padding: 8px 0;'><span style='background-color: #d4edda; color: #155724; padding: 4px 12px; border-radius: 4px; font-weight: bold;'>APPROVED</span></td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style='background-color: #e9f7ef; border: 1px solid #b8e6c1; border-radius: 8px; padding: 15px; margin: 20px 0;'>
                                <p style='color: #0f5132; font-family: Roboto, sans-serif; font-size: 14px; margin: 0; font-weight: 500;'>
                                    <strong>Important:</strong> Please arrive at the church at least 30 minutes before the scheduled ceremony time. This allows time for final preparations and ensures the ceremony begins promptly.
                                </p>
                            </div>
                            
                            <div style='margin-top: 30px;'>
                                <h3 style='color: #573901; font-family: Montserrat, sans-serif; font-size: 18px;'>Important Wedding Reminders:</h3>
                                <ul style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; padding-left: 20px;'>
                                    <li style='margin-bottom: 10px;'>Confirm attendance of all wedding sponsors (ninong and ninang)</li>
                                    <li style='margin-bottom: 10px;'>Attend the mandatory wedding rehearsal (schedule to be confirmed)</li>
                                    <li style='margin-bottom: 10px;'>Bring all original documents for final verification</li>
                                    <li style='margin-bottom: 10px;'>Coordinate with your wedding coordinator for ceremony arrangements</li>
                                    <li style='margin-bottom: 10px;'>Ensure wedding rings are ready for the exchange of vows</li>
                                    <li style='margin-bottom: 10px;'>Prepare all necessary personal items for the ceremony</li>
                                    <li style='margin-bottom: 10px;'>Both bride and groom should receive the Sacrament of Reconciliation before the wedding</li>
                                </ul>
                            </div>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 20px;'>After the wedding ceremony, your official marriage certificate will be available for download through our parish website within 7-10 business days. You will receive notification once it's ready.</p>
                            
                            <div style='margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #573901;'>
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin: 0; font-style: italic;'>\"What God has joined together, let no one separate.\" - Mark 10:9<br><br>May your marriage be blessed with love, joy, and faithfulness.</p>
                            </div>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 30px;'>If you have any questions or need to make any changes, please contact our parish office immediately.</p>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 40px;'>We are honored to celebrate this sacred union with you.<br><br>God bless your marriage,<br><strong style='color: #573901;'>Parish of Divine Mercy</strong><br>Marriage Ministry</p>
                        </div>
                        
                        <div style='background: linear-gradient(to right, #710808, #ffcccc); height: 2px; width: 100%;'></div>
                        
                        <div style='background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;'>
                            <p style='color: #555; margin: 5px 0; font-family: Roboto, sans-serif;'>This is an automated message. Please do not reply to this email.</p>
                            <p style='color: #555; margin: 5px 0; font-family: Roboto, sans-serif;'>Parish of Divine Mercy | Alawihao, Daet, Camarines Norte | parishofdivinemercy@gmail.com</p>
                        </div>
                    </div>
                </body>
                </html>
            ";
            
            // Plain text version for non-HTML mail clients - UPDATED
            $mail->AltBody = "Dear {$fullName},\n\n" .
                "We are pleased to inform you that your Marriage Application for the Parish of Divine Mercy has been APPROVED!\n\n" .
                "Your wedding ceremony has been scheduled for the date and time indicated below:\n\n" .
                "Wedding Ceremony Details:\n" .
                "Groom: {$groomName}\n" .
                "Bride: {$brideName}\n" .
                "Wedding Date: {$marriageDate}\n" .
                "Wedding Time: {$marriageTime}\n" .
                "Officiating Priest: {$priestName}\n" .
                "Location: Parish of Divine Mercy, Alawihao, Daet\n" .
                "Status: APPROVED\n\n" .
                "IMPORTANT: Please arrive at the church at least 30 minutes before the scheduled ceremony time.\n\n" .
                "Important Wedding Reminders:\n" .
                "- Confirm attendance of all wedding sponsors (ninong and ninang)\n" .
                "- Attend the mandatory wedding rehearsal (schedule to be confirmed)\n" .
                "- Bring all original documents for final verification\n" .
                "- Coordinate with your wedding coordinator for ceremony arrangements\n" .
                "- Ensure wedding rings are ready for the exchange of vows\n" .
                "- Prepare all necessary personal items for the ceremony\n" .
                "- Both bride and groom should receive the Sacrament of Reconciliation before the wedding\n\n" .
                "After the wedding ceremony, your official marriage certificate will be available for download through our parish website within 7-10 business days.\n\n" .
                "We are honored to celebrate this sacred union with you.\n\n" .
                "God bless your marriage,\nParish of Divine Mercy\nMarriage Ministry";

            error_log('[MARRIAGE_EMAIL] Attempting to send email...');
            if ($mail->send()) {
                error_log('[MARRIAGE_EMAIL] Email sent successfully to: ' . $userEmail);
                $response["success"] = true;
                $response["message"] = "Approval email has been sent to " . htmlspecialchars($userEmail);
                $response["email_sent"] = true;
            } else {
                error_log('[MARRIAGE_EMAIL] Email send failed: ' . $mail->ErrorInfo);
                $response["success"] = true; // Still mark as success for the main operation
                $response["message"] = "Marriage was approved, but email could not be sent.";
                $response["email_sent"] = false;
                $response["email_error"] = $mail->ErrorInfo;
            }
        } catch (Exception $e) {
            error_log('[MARRIAGE_EMAIL] Exception: ' . $e->getMessage());
            $response["success"] = true; // Still mark as success for the main operation
            $response["message"] = "Marriage was approved, but email could not be sent.";
            $response["email_sent"] = false;
            $response["email_error"] = $e->getMessage();
        }
    } else {
        handleError("Invalid request method. Only POST requests are accepted.");
    }
} catch (Exception $e) {
    handleError("An unexpected error occurred", $e->getMessage());
}

// Clear any previous output
ob_end_clean();

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>