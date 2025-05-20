<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Respond to preflight (OPTIONS) request
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

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get and parse JSON data
    $jsonData = file_get_contents("php://input");
    $data = json_decode($jsonData, true);

    if (isset($data['clientID']) && !empty($data['clientID']) && 
        isset($data['blessingData']) && !empty($data['blessingData'])) {
        
        $clientID = $data['clientID'];
        $blessingData = $data['blessingData'];
        
        // Get client's email from client_registration table
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
            
            // Create new PHPMailer instance
            $mail = new PHPMailer(true);

            try {
                // Server settings
                $mail->isSMTP();
                $mail->Host       = 'smtp.gmail.com';
                $mail->SMTPAuth   = true;
                $mail->Username   = 'parishofdivinemercy@gmail.com';
                $mail->Password   = 'scdq scnf milp uson';
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port       = 587;

                // Recipients
                $mail->setFrom('parishofdivinemercy@gmail.com', 'Parish of Divine Mercy');
                $mail->addAddress($userEmail, $fullName);

                // Format the date
                $blessingDate = new DateTime($blessingData['preferredDate']);
                $formattedDate = $blessingDate->format('F j, Y');
                
                // Extract blessing type if available
                $blessingType = isset($blessingData['blessingType']) ? $blessingData['blessingType'] : 'General Blessing';
                
                // Email content
                $mail->isHTML(true);
                $mail->Subject = 'Blessing Ceremony Appointment Request - Parish of Divine Mercy';
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
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>Thank you for scheduling a blessing ceremony appointment at the Parish of Divine Mercy.</p>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>Your appointment request is currently <strong style='color: #b3701f;'>PENDING</strong> for confirmation by our parish office.</p>
                                
                                <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #710808;'>
                                    <h3 style='color: #573901; font-family: Montserrat, sans-serif; margin-top: 0; font-size: 18px;'>Appointment Details:</h3>
                                    <table style='width: 100%; font-family: Roboto, sans-serif; color: #000;'>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Blessing Type:</td>
                                            <td style='padding: 8px 0;'>{$blessingType}</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Preferred Date:</td>
                                            <td style='padding: 8px 0;'>{$formattedDate}</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Preferred Time:</td>
                                            <td style='padding: 8px 0;'>{$blessingData['preferredTime']}</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Status:</td>
                                            <td style='padding: 8px 0;'><span style='background-color: #f8d7da; color: #721c24; padding: 4px 12px; border-radius: 4px; font-weight: bold;'>PENDING</span></td>
                                        </tr>
                                    </table>
                                </div>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 20px;'>Our parish staff will review your appointment request. You will receive another email once your appointment has been confirmed or if any changes are needed.</p>
                                
                                <div style='margin-top: 30px;'>
                                    <h3 style='color: #573901; font-family: Montserrat, sans-serif; font-size: 18px;'>Important Reminders:</h3>
                                    <ul style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; padding-left: 20px;'>
                                        <li style='margin-bottom: 10px;'>Please arrive at least 15 minutes before your scheduled time</li>
                                        <li style='margin-bottom: 10px;'>Bring any items that need to be blessed if applicable</li>
                                        <li style='margin-bottom: 10px;'>Observe proper church attire and decorum</li>
                                        <li style='margin-bottom: 10px;'>If you need to reschedule, please contact the parish office at least 24 hours before</li>
                                    </ul>
                                </div>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 40px;'>God bless,<br><strong style='color: #573901;'>Parish of Divine Mercy</strong></p>
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
                
                // Plain text version
                $mail->AltBody = "Dear {$fullName},\n\n" .
                    "Thank you for scheduling a blessing ceremony appointment at the Parish of Divine Mercy.\n" .
                    "Your appointment request is currently PENDING for confirmation by our parish office.\n\n" .
                    "Appointment Details:\n" .
                    "Blessing Type: {$blessingType}\n" .
                    "Preferred Date: {$formattedDate}\n" .
                    "Preferred Time: {$blessingData['preferredTime']}\n" .
                    "Status: PENDING\n\n" .
                    "Our parish staff will review your appointment request. You will receive another email once confirmed.\n\n" .
                    "Important Reminders:\n" .
                    "- Please arrive at least 15 minutes before your scheduled time\n" .
                    "- Bring any items that need to be blessed if applicable\n" .
                    "- Observe proper church attire and decorum\n" .
                    "- If you need to reschedule, please contact the parish office at least 24 hours before\n\n" .
                    "God bless,\nParish of Divine Mercy";

                if ($mail->send()) {
                    $response["success"] = true;
                    $response["message"] = "Confirmation email has been sent to " . htmlspecialchars($userEmail);
                } else {
                    throw new Exception("Email not sent: " . $mail->ErrorInfo);
                }
            } catch (Exception $e) {
                $response["success"] = false;
                $response["message"] = "Failed to send email. Error: " . $mail->ErrorInfo;
            }
        } else {
            $response["success"] = false;
            $response["message"] = "Client profile not found";
        }
        
        $stmt->close();
    } else {
        $response["message"] = "Error: Client ID and blessing data are required.";
    }
} else {
    $response["message"] = "Invalid request method. Only POST requests are accepted.";
}

$conn->close();
echo json_encode($response);