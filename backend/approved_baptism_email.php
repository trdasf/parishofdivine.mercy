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
        error_log("[BAPTISM_EMAIL_ERROR] " . $message);
    }
    
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Get and parse JSON data
        $jsonData = file_get_contents("php://input");
        $data = json_decode($jsonData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            handleError("Invalid JSON format: " . json_last_error_msg());
        }
    
        // Log received data for debugging
        error_log("Received baptism approval email request: " . $jsonData);
    
        // Validate input data
        if (!isset($data['baptismID']) || empty($data['baptismID'])) {
            handleError("Baptism ID is required");
        }
        
        $baptismID = $data['baptismID'];
        
        // Get the client ID associated with the baptism
        $stmt = $conn->prepare("SELECT clientID FROM baptism_application WHERE baptismID = ?");
        if (!$stmt) {
            handleError("Prepare statement failed", $conn->error);
        }
        
        $stmt->bind_param("i", $baptismID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows == 0) {
            handleError("No baptism record found with ID: " . $baptismID);
        }
        
        $baptismInfo = $result->fetch_assoc();
        $clientID = $baptismInfo['clientID'];
        
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
        
        error_log('[BAPTISM_EMAIL] Preparing to send approval email to: ' . $userEmail . ' (' . $fullName . ')');

        // Get the baptism child details
        $stmt = $conn->prepare("
            SELECT b.firstName, b.middleName, b.lastName
            FROM baptism_application b 
            WHERE b.baptismID = ?");
        if (!$stmt) {
            handleError("Prepare statement failed", $conn->error);
        }
        
        $stmt->bind_param("i", $baptismID);
        $stmt->execute();
        $baptismResult = $stmt->get_result();
        
        if ($baptismResult->num_rows == 0) {
            handleError("Baptism details not found for ID: " . $baptismID);
        }
        
        $baptismData = $baptismResult->fetch_assoc();

        // Get the approved appointment details
        $stmt = $conn->prepare("
            SELECT date, time, priest 
            FROM approved_appointments 
            WHERE sacramentID = ? AND sacrament_type = 'Baptism'");
        if (!$stmt) {
            handleError("Prepare statement failed for appointment query", $conn->error);
        }
        
        $stmt->bind_param("i", $baptismID);
        $stmt->execute();
        $appointmentResult = $stmt->get_result();
        
        if ($appointmentResult->num_rows == 0) {
            handleError("Approved appointment details not found for baptism ID: " . $baptismID);
        }
        
        $appointmentData = $appointmentResult->fetch_assoc();
        
        // Create new PHPMailer instance
        $mail = new PHPMailer(true);

        try {
            error_log('[BAPTISM_EMAIL] Configuring PHPMailer...');
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

            error_log('[BAPTISM_EMAIL] Setting From/To...');
            $mail->setFrom('parishofdivinemercy@gmail.com', 'Parish of Divine Mercy');
            $mail->addAddress($userEmail, $fullName);

            // CORRECTED: Format the date for display (December 23, 2025 format)
            $baptismDate = isset($appointmentData['date']) ? 
                date('F j, Y', strtotime($appointmentData['date'])) : '';
            
            // CORRECTED: Format time to 12-hour format with AM/PM (3:00 PM format)
            $baptismTime = '';
            if (isset($appointmentData['time']) && !empty($appointmentData['time'])) {
                // Convert 24-hour format to 12-hour format with AM/PM
                $timeObj = DateTime::createFromFormat('H:i:s', $appointmentData['time']);
                if ($timeObj) {
                    $baptismTime = $timeObj->format('g:i A'); // e.g., "3:00 PM"
                } else {
                    // Fallback: try without seconds
                    $timeObj = DateTime::createFromFormat('H:i', $appointmentData['time']);
                    if ($timeObj) {
                        $baptismTime = $timeObj->format('g:i A');
                    } else {
                        $baptismTime = $appointmentData['time']; // Use original if conversion fails
                    }
                }
            }
            
            $priest = isset($appointmentData['priest']) ? $appointmentData['priest'] : '';
            
            $childName = trim(($baptismData['firstName'] ?? '') . ' ' . 
                        ($baptismData['middleName'] ?? '') . ' ' . 
                        ($baptismData['lastName'] ?? ''));

            // Email content with matching color scheme - UPDATED MESSAGING
            $mail->isHTML(true);
            $mail->Subject = 'Baptism Application APPROVED - Parish of Divine Mercy';
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
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>We are pleased to inform you that your <b>Baptism Application</b> for the Parish of Divine Mercy has been <strong style='color: #28a745;'>APPROVED</strong>!</p>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>The baptism ceremony has been scheduled for the date and time indicated below:</p>
                            
                            <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;'>
                                <h3 style='color: #573901; font-family: Montserrat, sans-serif; margin-top: 0; font-size: 18px;'>Baptism Ceremony Details:</h3>
                                <table style='width: 100%; font-family: Roboto, sans-serif; color: #000;'>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Child's Name:</td>
                                        <td style='padding: 8px 0;'>{$childName}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Ceremony Date:</td>
                                        <td style='padding: 8px 0;'><strong>{$baptismDate}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Ceremony Time:</td>
                                        <td style='padding: 8px 0;'><strong>{$baptismTime}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Officiating Priest:</td>
                                        <td style='padding: 8px 0;'>{$priest}</td>
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
                                <h3 style='color: #573901; font-family: Montserrat, sans-serif; font-size: 18px;'>What to Bring on the Ceremony Day:</h3>
                                <ul style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; padding-left: 20px;'>
                                    <li style='margin-bottom: 10px;'>White baptismal clothing for the child (gown or outfit appropriate for the ceremony)</li>
                                    <li style='margin-bottom: 10px;'>Baptismal candle (available at the parish office or religious stores)</li>
                                    <li style='margin-bottom: 10px;'>The godparents must be present at the ceremony</li>
                                    <li style='margin-bottom: 10px;'>Valid ID for parents and godparents for verification</li>
                                    <li style='margin-bottom: 10px;'>Child's birth certificate (original copy for final verification)</li>
                                </ul>
                            </div>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 20px;'>After the baptism ceremony, the baptismal certificate will be available for download through our parish website within 2-3 business days.</p>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 30px;'>If you have any questions or need to make any changes, please contact our parish office immediately.</p>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 40px;'>We look forward to celebrating this sacred milestone with your family.<br><br>God bless,<br><strong style='color: #573901;'>Parish of Divine Mercy</strong><br>Baptism Ministry</p>
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
                "We are pleased to inform you that your Baptism Application for the Parish of Divine Mercy has been APPROVED!\n\n" .
                "The baptism ceremony has been scheduled for the date and time indicated below:\n\n" .
                "Baptism Ceremony Details:\n" .
                "Child's Name: {$childName}\n" .
                "Ceremony Date: {$baptismDate}\n" .
                "Ceremony Time: {$baptismTime}\n" .
                "Officiating Priest: {$priest}\n" .
                "Status: APPROVED\n\n" .
                "IMPORTANT: Please arrive at the church at least 30 minutes before the scheduled ceremony time.\n\n" .
                "What to Bring on the Ceremony Day:\n" .
                "- White baptismal clothing for the child (gown or outfit appropriate for the ceremony)\n" .
                "- Baptismal candle (available at the parish office or religious stores)\n" .
                "- The godparents must be present at the ceremony\n" .
                "- Valid ID for parents and godparents for verification\n" .
                "- Child's birth certificate (original copy for final verification)\n\n" .
                "After the baptism ceremony, the baptismal certificate will be available for download through our parish website within 2-3 business days.\n\n" .
                "We look forward to celebrating this sacred milestone with your family.\n\n" .
                "God bless,\nParish of Divine Mercy\nBaptism Ministry";

            error_log('[BAPTISM_EMAIL] Attempting to send email...');
            if ($mail->send()) {
                error_log('[BAPTISM_EMAIL] Email sent successfully to: ' . $userEmail);
                $response["success"] = true;
                $response["message"] = "Approval email has been sent to " . htmlspecialchars($userEmail);
            } else {
                error_log('[BAPTISM_EMAIL] Email send failed: ' . $mail->ErrorInfo);
                handleError("Email not sent", $mail->ErrorInfo);
            }
        } catch (Exception $e) {
            error_log('[BAPTISM_EMAIL] Exception: ' . $e->getMessage());
            handleError("Failed to send email", $e->getMessage());
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