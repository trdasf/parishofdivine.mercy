<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Set JSON header and CORS headers
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include PHPMailer
require_once $_SERVER['DOCUMENT_ROOT'] . '/PHPMailer-master/src/Exception.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/PHPMailer-master/src/PHPMailer.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/PHPMailer-master/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Handle preflight request
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

// Database connection
$servername = "localhost";
$username = "u572625467_divine_mercy";
$password = "Parish_12345";
$dbname = "u572625467_parish";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Database connection failed"]));
}

// Default response
$response = [
    "success" => false,
    "message" => "Unknown error occurred"
];

// Log function for debugging
function logError($message) {
    error_log("[COMMUNION_EMAIL_ERROR] " . $message);
}

try {
    // Get and parse JSON data
    $jsonData = file_get_contents("php://input");
    $data = json_decode($jsonData, true);
    
    // Log received data for debugging
    error_log("Received communion approval email request: " . $jsonData);
    
    if (isset($data['communionID'])) {
        $communionID = $data['communionID'];
        
        // Get communion application details and client info
        $stmt = $conn->prepare("
            SELECT c.*, cr.clientID, cr.first_name AS client_first_name, cr.last_name AS client_last_name, cr.email 
            FROM communion_application c
            INNER JOIN client_registration cr ON c.clientID = cr.clientID
            WHERE c.communionID = ?");
        
        $stmt->bind_param("i", $communionID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $communionData = $result->fetch_assoc();
            
            // Get the approved appointment details
            $stmt = $conn->prepare("
                SELECT date, time, priest 
                FROM approved_appointments 
                WHERE sacramentID = ? AND sacrament_type = 'Communion'");
            
            if (!$stmt) {
                throw new Exception("Prepare statement failed for appointment query: " . $conn->error);
            }
            
            $stmt->bind_param("i", $communionID);
            $stmt->execute();
            $appointmentResult = $stmt->get_result();
            
            if ($appointmentResult->num_rows == 0) {
                throw new Exception("Approved appointment details not found for communion ID: " . $communionID);
            }
            
            $appointmentData = $appointmentResult->fetch_assoc();
            
            // Create new PHPMailer instance
            $mail = new PHPMailer(true);
            
            try {
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
                
                // Recipients
                $mail->setFrom('parishofdivinemercy@gmail.com', 'Parish of Divine Mercy');
                $mail->addAddress($communionData['email'], $communionData['client_first_name'] . ' ' . $communionData['client_last_name']);
                
                // CORRECTED: Format the date for display (December 23, 2025 format)
                $communionDate = new DateTime($appointmentData['date']);
                $formattedDate = $communionDate->format('F j, Y');
                
                // CORRECTED: Format time to 12-hour format with AM/PM (3:00 PM format)
                $communionTime = '';
                if (isset($appointmentData['time']) && !empty($appointmentData['time'])) {
                    // Convert 24-hour format to 12-hour format with AM/PM
                    $timeObj = DateTime::createFromFormat('H:i:s', $appointmentData['time']);
                    if ($timeObj) {
                        $communionTime = $timeObj->format('g:i A'); // e.g., "3:00 PM"
                    } else {
                        // Fallback: try without seconds
                        $timeObj = DateTime::createFromFormat('H:i', $appointmentData['time']);
                        if ($timeObj) {
                            $communionTime = $timeObj->format('g:i A');
                        } else {
                            $communionTime = $appointmentData['time']; // Use original if conversion fails
                        }
                    }
                }
                
                $priest = $appointmentData['priest'];
                
                // Client name
                $clientName = $communionData['client_first_name'] . ' ' . $communionData['client_last_name'];
                
                // Full name of the child
                $childName = $communionData['first_name'] . ' ' . $communionData['middle_name'] . ' ' . $communionData['last_name'];
                
                // Email content with matching color scheme - UPDATED MESSAGING
                $mail->isHTML(true);
                $mail->Subject = 'First Communion Application APPROVED - Parish of Divine Mercy';
                $mail->Body = "
                    <html>
                    <body style='font-family: Roboto, Arial, sans-serif; line-height: 1.6; color: #000; margin: 0; padding: 0;'>
                        <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>
                            <div style='background-color: #573901; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;'>
                                <h1 style='color: white; margin: 0; font-family: Montserrat, sans-serif; font-size: 24px; letter-spacing: 1px;'>Parish of Divine Mercy</h1>
                            </div>
                            
                            <div style='background: linear-gradient(to right, #710808, #ffcccc); height: 4px; width: 100%;'></div>
                            
                            <div style='padding: 30px 20px; background-color: #fff;'>
                                <h2 style='color: #573901; font-family: Montserrat, sans-serif; margin-bottom: 20px;'>Dear {$clientName},</h2>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>We are pleased to inform you that your <b>First Holy Communion Application</b> for the Parish of Divine Mercy has been <strong style='color: #28a745;'>APPROVED</strong>!</p>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>Your child's First Holy Communion ceremony has been scheduled for the date and time indicated below:</p>
                                
                                <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;'>
                                    <h3 style='color: #573901; font-family: Montserrat, sans-serif; margin-top: 0; font-size: 18px;'>First Communion Ceremony Details:</h3>
                                    <table style='width: 100%; font-family: Roboto, sans-serif; color: #000;'>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Child's Name:</td>
                                            <td style='padding: 8px 0;'>{$childName}</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Ceremony Date:</td>
                                            <td style='padding: 8px 0;'><strong>{$formattedDate}</strong></td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Ceremony Time:</td>
                                            <td style='padding: 8px 0;'><strong>{$communionTime}</strong></td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Celebrating Priest:</td>
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
                                
                                <div style='margin-top: 20px;'>
                                    <h3 style='color: #573901; font-family: Montserrat, sans-serif; font-size: 18px;'>Important Reminders for the Ceremony:</h3>
                                    <ul style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; padding-left: 20px;'>
                                        <li style='margin-bottom: 10px;'>Children should wear appropriate First Communion attire</li>
                                        <li style='margin-bottom: 10px;'><strong>Boys:</strong> White polo or barong, black pants, and formal shoes</li>
                                        <li style='margin-bottom: 10px;'><strong>Girls:</strong> White dress with sleeves (modest), white veil (optional), and formal shoes</li>
                                        <li style='margin-bottom: 10px;'>Please ensure your child has completed all required preparation classes</li>
                                        <li style='margin-bottom: 10px;'>Kindly bring all original documents for final verification</li>
                                        <li style='margin-bottom: 10px;'>Your child should fast for at least 1 hour before receiving Holy Communion (water is permitted)</li>
                                        <li style='margin-bottom: 10px;'>Photography is allowed but please be respectful during the sacred ceremony</li>
                                    </ul>
                                </div>
                                
                                <div style='margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #573901;'>
                                    <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin: 0; font-style: italic;'>\"This is the bread that comes down from heaven, so that one may eat of it and not die.\" - John 6:50</p>
                                </div>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 30px;'>If you have any questions or need to make any changes, please contact our parish office immediately.</p>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 40px;'>We are honored to celebrate this sacred milestone with your family.<br><br>With joy and blessings,<br><strong style='color: #573901;'>Parish of Divine Mercy</strong><br>First Communion Ministry</p>
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
                $mail->AltBody = "Dear {$clientName},\n\n" .
                    "We are pleased to inform you that your First Holy Communion Application for the Parish of Divine Mercy has been APPROVED!\n\n" .
                    "Your child's First Holy Communion ceremony has been scheduled for the date and time indicated below:\n\n" .
                    "First Communion Ceremony Details:\n" .
                    "Child's Name: {$childName}\n" .
                    "Ceremony Date: {$formattedDate}\n" .
                    "Ceremony Time: {$communionTime}\n" .
                    "Celebrating Priest: {$priest}\n" .
                    "Status: APPROVED\n\n" .
                    "IMPORTANT: Please arrive at the church at least 30 minutes before the scheduled ceremony time.\n\n" .
                    "Please ensure your child wears appropriate First Communion attire and has completed all required preparation classes.\n\n" .
                    "We are honored to celebrate this sacred milestone with your family.\n\n" .
                    "With joy and blessings,\nParish of Divine Mercy\nFirst Communion Ministry";
                
                error_log('[COMMUNION_EMAIL] Attempting to send email...');
                
                // Send the email
                if ($mail->send()) {
                    error_log('[COMMUNION_EMAIL] Email sent successfully to: ' . $communionData['email']);
                    $response["success"] = true;
                    $response["message"] = "Approval email has been sent to " . htmlspecialchars($communionData['email']);
                } else {
                    error_log('[COMMUNION_EMAIL] Email send failed: ' . $mail->ErrorInfo);
                    throw new Exception("Email not sent: " . $mail->ErrorInfo);
                }
            } catch (Exception $e) {
                logError("Mailer Error: " . $e->getMessage());
                $response["success"] = false;
                $response["message"] = "Failed to send approval email. Error: " . $e->getMessage();
            }
        } else {
            $response["success"] = false;
            $response["message"] = "Communion record not found for ID: " . $communionID;
        }
    } else {
        logError("Missing communion ID in request");
        $response["message"] = "Error: Communion ID is required";
    }
} catch (Exception $e) {
    logError("Exception: " . $e->getMessage());
    $response["success"] = false;
    $response["message"] = "An error occurred: " . $e->getMessage();
}

$conn->close();

// Return JSON response
echo json_encode($response);
?>