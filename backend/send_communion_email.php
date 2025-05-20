<?php
// Enable error reporting for debugging (consider disabling in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Respond to preflight (OPTIONS) request and exit
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

// Include PHPMailer
require_once $_SERVER['DOCUMENT_ROOT'] . '/PHPMailer-master/src/Exception.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/PHPMailer-master/src/PHPMailer.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/PHPMailer-master/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

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
    error_log("[EMAIL ERROR] " . $message);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get and parse JSON data
    $jsonData = file_get_contents("php://input");
    $data = json_decode($jsonData, true);

    // Log received data for debugging
    error_log("Received email request: " . $jsonData);

    // Validate input data
    if (isset($data['clientID']) && !empty($data['clientID']) && 
        isset($data['communionData']) && !empty($data['communionData'])) {
        
        $clientID = $data['clientID'];
        $communionData = $data['communionData'];
        
        // First, get the client's email from client_registration table
        $stmt = $conn->prepare("SELECT email, first_name, last_name FROM client_registration WHERE clientID = ?");
        $stmt->bind_param("i", $clientID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $clientInfo = $result->fetch_assoc();
            $userEmail = $clientInfo['email'];
            $firstName = $clientInfo['first_name'];
            $lastName = $clientInfo['last_name'];
            $fullName = $firstName . ' ' . $lastName;
            
            error_log('[SEND_EMAIL] Preparing to send email to: ' . $userEmail . ' (' . $fullName . ')');

            // Create new PHPMailer instance
            $mail = new PHPMailer(true);

            try {
                error_log('[SEND_EMAIL] Configuring PHPMailer...');
                // Server settings
                $mail->SMTPDebug = 0; // Disable debug output
                $mail->isSMTP();
                $mail->Host       = 'smtp.gmail.com';
                $mail->SMTPAuth   = true;
                $mail->Username   = 'parishofdivinemercy@gmail.com';
                $mail->Password   = 'scdq scnf milp uson';
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port       = 587;

                error_log('[SEND_EMAIL] Setting From/To...');
                $mail->setFrom('parishofdivinemercy@gmail.com', 'Parish of Divine Mercy');
                $mail->addAddress($userEmail, $fullName);

                // Format the date for display
                $communionDate = new DateTime($communionData['date']);
                $formattedDate = $communionDate->format('F j, Y');
                
                error_log("Preparing email content...");
                // Email content with matching color scheme
                $mail->isHTML(true);
                $mail->Subject = 'Holy Communion Appointment Pending - Parish of Divine Mercy';
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
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>Thank you for submitting your <b>Holy Communion application</b> to the Parish of Divine Mercy.</p>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>Your appointment is currently <strong style='color: #b3701f;'>PENDING</strong> for review by our parish office.</p>
                                
                                <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #710808;'>
                                    <h3 style='color: #573901; font-family: Montserrat, sans-serif; margin-top: 0; font-size: 18px;'>Appointment Details:</h3>
                                    <table style='width: 100%; font-family: Roboto, sans-serif; color: #000;'>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Candidate's Name:</td>
                                            <td style='padding: 8px 0;'>{$communionData['firstName']} {$communionData['middleName']} {$communionData['lastName']}</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Communion Date:</td>
                                            <td style='padding: 8px 0;'>{$formattedDate}</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Time:</td>
                                            <td style='padding: 8px 0;'>{$communionData['time']}</td>
                                        </tr>
                                        <tr>
                                           
                                        </tr>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Status:</td>
                                            <td style='padding: 8px 0;'><span style='background-color: #f8d7da; color: #721c24; padding: 4px 12px; border-radius: 4px; font-weight: bold;'>PENDING</span></td>
                                        </tr>
                                    </table>
                                </div>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 20px;'>Our parish staff will review your application and documents. You will receive another email once your appointment has been approved or if additional information is needed.</p>
                                
                                <div style='margin-top: 30px;'>
                                    <h3 style='color: #573901; font-family: Montserrat, sans-serif; font-size: 18px;'>Next Steps:</h3>
                                    <ul style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; padding-left: 20px;'>
                                        <li style='margin-bottom: 10px;'>Wait for the approval email from our parish office</li>
                                        <li style='margin-bottom: 10px;'>Prepare all original documents for verification</li>
                                        <li style='margin-bottom: 10px;'>Attend the First Communion Seminar (details will be provided upon approval)</li>
                                    </ul>
                                </div>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 30px;'>If you have any questions, please contact our parish office.</p>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 40px;'>God bless,<br><strong style='color: #573901;'>Parish of Divine Mercy</strong><br>First Communion Ministry</p>
                            </div>
                            
                            <div style='background: linear-gradient(to right, #710808, #ffcccc); height: 2px; width: 100%;'></div>
                            
                            <div style='background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;'>
                                <p style='color: #555; margin: 5px 0; font-family: Roboto, sans-serif;'>This is an automated message. Please do not reply to this email.</p>
                                <p style='color: #555; margin: 5px 0; font-family: Roboto, sans-serif;'>Parish of Divine Mercy | Contact: (your parish contact info)</p>
                            </div>
                        </div>
                    </body>
                    </html>
                ";
                
                // Plain text version for non-HTML mail clients
                $mail->AltBody = "Dear {$fullName},\n\n" .
                    "Thank you for submitting your Holy Communion application to the Parish of Divine Mercy.\n" .
                    "Your appointment is currently PENDING for review by our parish office.\n\n" .
                    "Appointment Details:\n" .
                    "Candidate's Name: {$communionData['firstName']} {$communionData['middleName']} {$communionData['lastName']}\n" .
                    "Date: {$formattedDate}\n" .
                    "Time: {$communionData['time']}\n" .
                    "Status: PENDING\n\n" .
                    "Our parish staff will review your application. You will receive another email once approved.\n\n" .
                    "God bless,\nParish of Divine Mercy";

                error_log('[SEND_EMAIL] Attempting to send email...');
                if ($mail->send()) {
                    error_log('[SEND_EMAIL] Email sent successfully to: ' . $userEmail);
                    $response["success"] = true;
                    $response["message"] = "Confirmation email has been sent to " . htmlspecialchars($userEmail);
                } else {
                    error_log('[SEND_EMAIL] Email send failed: ' . $mail->ErrorInfo);
                    throw new Exception("Email not sent: " . $mail->ErrorInfo);
                }
            } catch (Exception $e) {
                error_log('[SEND_EMAIL] Exception: ' . $e->getMessage());
                $response["success"] = false;
                $response["message"] = "Failed to send email. Error: " . $mail->ErrorInfo;
            }
        } else {
            error_log('[SEND_EMAIL] No client found for clientID: ' . $clientID);
            $response["success"] = false;
            $response["message"] = "Client profile not found";
        }
        
        $stmt->close();
    } else {
        logError("Missing required fields in request");
        $response["message"] = "Error: Client ID and communion data are required.";
    }
} else {
    logError("Invalid request method: " . $_SERVER["REQUEST_METHOD"]);
    $response["message"] = "Invalid request method. Only POST requests are accepted.";
}

$conn->close();

// Return JSON response
echo json_encode($response); 