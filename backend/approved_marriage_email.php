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

            // Format the date for display
            $marriageDate = isset($date) ? date('F j, Y', strtotime($date)) : '';
            $marriageTime = isset($time) ? $time : '';
            $priestName = isset($priest) ? $priest : '';
            
            $groomName = trim(($marriageData['groom_first_name'] ?? '') . ' ' . 
                       ($marriageData['groom_middle_name'] ?? '') . ' ' . 
                       ($marriageData['groom_last_name'] ?? ''));
            
            $brideName = trim(($marriageData['bride_first_name'] ?? '') . ' ' . 
                       ($marriageData['bride_middle_name'] ?? '') . ' ' . 
                       ($marriageData['bride_last_name'] ?? ''));

            // Email content with matching color scheme
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
                            
                            <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;'>
                                <h3 style='color: #573901; font-family: Montserrat, sans-serif; margin-top: 0; font-size: 18px;'>Marriage Details:</h3>
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
                                        <td style='padding: 8px 0; font-weight: 500;'>Date:</td>
                                        <td style='padding: 8px 0;'>{$marriageDate}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Time:</td>
                                        <td style='padding: 8px 0;'>{$marriageTime}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Priest:</td>
                                        <td style='padding: 8px 0;'>{$priestName}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Status:</td>
                                        <td style='padding: 8px 0;'><span style='background-color: #d4edda; color: #155724; padding: 4px 12px; border-radius: 4px; font-weight: bold;'>APPROVED</span></td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 20px;'>Please arrive at the church at least 30 minutes before the scheduled time. After the ceremony, a marriage certificate will be available for download through our website.</p>
                            
                            <div style='margin-top: 30px;'>
                                <h3 style='color: #573901; font-family: Montserrat, sans-serif; font-size: 18px;'>Important Reminders:</h3>
                                <ul style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; padding-left: 20px;'>
                                    <li style='margin-bottom: 10px;'>Confirm attendance of all wedding sponsors</li>
                                    <li style='margin-bottom: 10px;'>Attend the wedding rehearsal</li>
                                    <li style='margin-bottom: 10px;'>Make final arrangements for the ceremony</li>
                                    <li style='margin-bottom: 10px;'>Prepare all necessary personal items for the ceremony</li>
                                </ul>
                            </div>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 30px;'>If you have any questions, please contact our parish office.</p>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 40px;'>God bless your union,<br><strong style='color: #573901;'>Parish of Divine Mercy</strong><br>Marriage Ministry</p>
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
            
            // Plain text version for non-HTML mail clients
            $mail->AltBody = "Dear {$fullName},\n\n" .
                "We are pleased to inform you that your Marriage Application for the Parish of Divine Mercy has been APPROVED!\n\n" .
                "Marriage Details:\n" .
                "Groom: {$groomName}\n" .
                "Bride: {$brideName}\n" .
                "Date: {$marriageDate}\n" .
                "Time: {$marriageTime}\n" .
                "Priest: {$priestName}\n" .
                "Status: APPROVED\n\n" .
                "Please arrive at the church at least 30 minutes before the scheduled time. After the ceremony, a marriage certificate will be available for download through our website.\n\n" .
                "Important Reminders:\n" .
                "- Confirm attendance of all wedding sponsors\n" .
                "- Attend the wedding rehearsal\n" .
                "- Make final arrangements for the ceremony\n" .
                "- Prepare all necessary personal items for the ceremony\n\n" .
                "God bless your union,\nParish of Divine Mercy\nMarriage Ministry";

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