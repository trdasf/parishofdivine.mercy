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

// Set content type header
header("Content-Type: application/json");

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
        isset($data['funeralData']) && !empty($data['funeralData'])) {
        
        $clientID = $data['clientID'];
        $funeralData = $data['funeralData'];
        
        // First, get the client's email from client_profile table
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
            
            // Get requester email from the form data
            $requesterEmail = isset($funeralData['email']) ? $funeralData['email'] : null;
            // Create new PHPMailer instance
            $mail = new PHPMailer(true);

            try {
                // Server settings
                $mail->SMTPDebug = 0;                      // Set to 0 for production, 2 for debugging
                $mail->isSMTP();                           // Use SMTP
                $mail->Host       = 'smtp.gmail.com';      // Gmail SMTP server
                $mail->SMTPAuth   = true;                  // Enable SMTP authentication
                $mail->Username   = 'parishofdivinemercy@gmail.com'; // SMTP username
                $mail->Password   = 'obyk hxts jdsv lofs';       // Replace with your App Password
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Enable TLS encryption
                $mail->Port       = 587;                   // TCP port to connect to

                // Recipients
                $mail->setFrom('parishofdivinemercy@gmail.com', 'Parish of Divine Mercy');
                $mail->addAddress($userEmail, $fullName);  // Add client email
                if ($requesterEmail && filter_var($requesterEmail, FILTER_VALIDATE_EMAIL)) {
                    $mail->addAddress($requesterEmail); // Add requester email
                }

                // Format the date for display
                $funeralDate = new DateTime($funeralData['dateOfFuneralMass']);
                $formattedDate = $funeralDate->format('F j, Y');
                
                // Format time to 12-hour format with AM/PM
                $funeralTime = '';
                if (isset($funeralData['timeOfFuneralMass']) && !empty($funeralData['timeOfFuneralMass'])) {
                    // Convert 24-hour format to 12-hour format with AM/PM
                    $timeObj = DateTime::createFromFormat('H:i:s', $funeralData['timeOfFuneralMass']);
                    if ($timeObj) {
                        $funeralTime = $timeObj->format('g:i A'); // e.g., "3:00 PM"
                    } else {
                        // Fallback: try without seconds
                        $timeObj = DateTime::createFromFormat('H:i', $funeralData['timeOfFuneralMass']);
                        if ($timeObj) {
                            $funeralTime = $timeObj->format('g:i A');
                        } else {
                            $funeralTime = $funeralData['timeOfFuneralMass']; // Use original if conversion fails
                        }
                    }
                }
                
                // Email content with matching color scheme
                $mail->isHTML(true);
                $mail->Subject = 'Funeral Mass Application Pending - Parish of Divine Mercy';
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
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>We have received your <b>Funeral Mass application</b> for your beloved departed. Our parish extends its deepest condolences to you and your family during this difficult time.</p>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>Your application is currently <strong style='color: #b3701f;'>PENDING</strong> for review by our parish office.</p>
                                
                                <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #710808;'>
                                    <h3 style='color: #573901; font-family: Montserrat, sans-serif; margin-top: 0; font-size: 18px;'>Funeral Mass Request Details:</h3>
                                    <table style='width: 100%; font-family: Roboto, sans-serif; color: #000;'>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Deceased:</td>
                                            <td style='padding: 8px 0;'>{$funeralData['deceasedFirstName']} {$funeralData['deceasedMiddleName']} {$funeralData['deceasedLastName']}</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Requested Date:</td>
                                            <td style='padding: 8px 0;'>{$formattedDate}</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Requested Time:</td>
                                            <td style='padding: 8px 0;'>{$funeralTime}</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Status:</td>
                                            <td style='padding: 8px 0;'><span style='background-color: #f8d7da; color: #721c24; padding: 4px 12px; border-radius: 4px; font-weight: bold;'>PENDING</span></td>
                                        </tr>
                                    </table>
                                </div>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 20px;'>Our parish staff will review your application and documents shortly. You will receive another email once your application has been approved or if additional information is needed.</p>
                                
                                <div style='background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;'>
                                    <p style='color: #856404; font-family: Roboto, sans-serif; font-size: 14px; margin: 0; font-weight: 500;'>
                                        <strong>Please Note:</strong> This is a request for scheduling a Funeral Mass. Final confirmation and scheduling will be provided once your application is approved and all requirements are verified.
                                    </p>
                                </div>
                                
                                <div style='margin-top: 30px;'>
                                    <h3 style='color: #573901; font-family: Montserrat, sans-serif; font-size: 18px;'>What to Expect Next:</h3>
                                    <ul style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; padding-left: 20px;'>
                                        <li style='margin-bottom: 10px;'>You will receive a confirmation once your application is approved</li>
                                        <li style='margin-bottom: 10px;'>Our parish staff may contact you for any clarifications or scheduling adjustments</li>
                                        <li style='margin-bottom: 10px;'>Please prepare all original documents for verification</li>
                                        <li style='margin-bottom: 10px;'>Coordinate with the funeral home regarding the arrangements</li>
                                        <li style='margin-bottom: 10px;'>Arrive at least 30 minutes before the scheduled mass</li>
                                    </ul>
                                </div>
                                
                                <div style='margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 8px;'>
                                    <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin: 0;'><em>\"Eternal rest grant unto them, O Lord, and let perpetual light shine upon them. May they rest in peace. Amen.\"</em></p>
                                </div>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 30px;'>If you have any questions, please contact our parish office.</p>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 40px;'>With deepest sympathy,<br><strong style='color: #573901;'>Parish of Divine Mercy</strong><br>Funeral Ministry</p>
                            </div>
                            
                            <div style='background: linear-gradient(to right, #710808, #ffcccc); height: 2px; width: 100%;'></div>
                            
                            <div style='background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;'>
                                <p style='color: #555; margin: 5px 0; font-family: Roboto, sans-serif;'>This is an automated message. Please do not reply to this email.</p>
                                <p style='color: #555; margin: 5px 0; font-family: Roboto, sans-serif;'>Parish of Divine Mercy | Contact: parishofdivinemercy@gmail.com</p>
                            </div>
                        </div>
                    </body>
                    </html>
                ";
                
                // Plain text version for non-HTML mail clients
                $mail->AltBody = "Dear {$fullName},\n\n" .
                    "We have received your Funeral Mass application for your beloved departed. Our parish extends its deepest condolences to you and your family during this difficult time.\n\n" .
                    "Your application is currently PENDING for review by our parish office.\n\n" .
                    "Funeral Mass Request Details:\n" .
                    "Deceased: {$funeralData['deceasedFirstName']} {$funeralData['deceasedMiddleName']} {$funeralData['deceasedLastName']}\n" .
                    "Requested Date: {$formattedDate}\n" .
                    "Requested Time: {$funeralTime}\n" .
                    "Status: PENDING\n\n" .
                    "Please Note: This is a request for scheduling a Funeral Mass. Final confirmation and scheduling will be provided once your application is approved and all requirements are verified.\n\n" .
                    "Our parish staff will review your application and documents shortly. You will receive another email once your application has been approved.\n\n" .
                    "With deepest sympathy,\nParish of Divine Mercy";

                // Send the email
                if ($mail->send()) {
                    $response["success"] = true;
                    $response["message"] = "Confirmation email has been sent to " . htmlspecialchars($userEmail);
                    error_log("Email successfully sent to: " . $userEmail);
                } else {
                    throw new Exception("Email not sent: " . $mail->ErrorInfo);
                }
            } catch (Exception $e) {
                logError("Mailer Error: " . $e->getMessage());
                $response["success"] = false;
                $response["message"] = "Failed to send email. Error: " . $mail->ErrorInfo;
            }
        } else {
            $response["success"] = false;
            $response["message"] = "Client profile not found";
        }
        
        $stmt->close();
    } else {
        logError("Missing required fields in request");
        $response["message"] = "Error: Client ID and funeral data are required.";
    }
} else {
    logError("Invalid request method: " . $_SERVER["REQUEST_METHOD"]);
    $response["message"] = "Invalid request method. Only POST requests are accepted.";
}

$conn->close();

// Return JSON response
echo json_encode($response);
?>