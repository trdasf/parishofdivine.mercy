<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once $_SERVER['DOCUMENT_ROOT'] . '/PHPMailer-master/src/Exception.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/PHPMailer-master/src/PHPMailer.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/PHPMailer-master/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$servername = "localhost";
$username = "u572625467_divine_mercy";
$password = "Parish_12345";
$dbname = "u572625467_parish";
$conn = new mysqli($servername, $username, $password, $dbname);

$response = ["success" => false, "message" => "Unknown error"];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $clientID = $data['clientID'];
    $anointingData = $data['anointingData'];

    // Get client email
    $stmt = $conn->prepare("SELECT email, first_name, last_name FROM client_registration WHERE clientID = ?");
    $stmt->bind_param("i", $clientID);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $client = $result->fetch_assoc();
        $userEmail = $client['email'];
        $fullName = $client['first_name'] . " " . $client['last_name'];

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'parishofdivinemercy@gmail.com';
            $mail->Password = 'obyk hxts jdsv lofs';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $mail->setFrom('parishofdivinemercy@gmail.com', 'Parish of Divine Mercy');
            $mail->addAddress($userEmail, $fullName);

            $mail->isHTML(true);
            $mail->Subject = 'Anointing of the Sick Application Pending - Parish of Divine Mercy';

            // Format dates and prepare data for email
            $anointingDate = isset($anointingData['dateOfAnointing']) ? date('F j, Y', strtotime($anointingData['dateOfAnointing'])) : '';
            $anointingTime = isset($anointingData['timeOfAnointing']) ? $anointingData['timeOfAnointing'] : '';
            
            $sickPersonName = trim(($anointingData['firstName'] ?? '') . ' ' . 
                              ($anointingData['middleName'] ?? '') . ' ' . 
                              ($anointingData['lastName'] ?? ''));
            
            $location = isset($anointingData['locationType']) ? $anointingData['locationType'] : '';
            if (isset($anointingData['locationName']) && !empty($anointingData['locationName'])) {
                $location .= ': ' . $anointingData['locationName'];
            }
            
            $address = '';
            if (isset($anointingData['street']) && !empty($anointingData['street'])) {
                $address .= $anointingData['street'] . ', ';
            }
            if (isset($anointingData['barangay']) && !empty($anointingData['barangay'])) {
                $address .= $anointingData['barangay'] . ', ';
            }
            if (isset($anointingData['municipality']) && !empty($anointingData['municipality'])) {
                $address .= $anointingData['municipality'] . ', ';
            }
            if (isset($anointingData['province']) && !empty($anointingData['province'])) {
                $address .= $anointingData['province'];
            }
            
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
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>Thank you for submitting your <b>Anointing of the Sick</b> application to the Parish of Divine Mercy.</p>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>Your request is currently <strong style='color: #b3701f;'>PENDING</strong> for review by our parish office.</p>
                            
                            <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #710808;'>
                                <h3 style='color: #573901; font-family: Montserrat, sans-serif; margin-top: 0; font-size: 18px;'>Request Details:</h3>
                                <table style='width: 100%; font-family: Roboto, sans-serif; color: #000;'>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Sick Person's Name:</td>
                                        <td style='padding: 8px 0;'>{$sickPersonName}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Date:</td>
                                        <td style='padding: 8px 0;'>{$anointingDate}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Time:</td>
                                        <td style='padding: 8px 0;'>{$anointingTime}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Location Type:</td>
                                        <td style='padding: 8px 0;'>{$location}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Address:</td>
                                        <td style='padding: 8px 0;'>{$address}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Status:</td>
                                        <td style='padding: 8px 0;'><span style='background-color: #f8d7da; color: #721c24; padding: 4px 12px; border-radius: 4px; font-weight: bold;'>PENDING</span></td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 20px;'>Our parish staff will review your request. You will receive another email once your request has been approved or if additional information is needed.</p>
                            
                            <div style='margin-top: 30px;'>
                                <h3 style='color: #573901; font-family: Montserrat, sans-serif; font-size: 18px;'>Important Notes:</h3>
                                <ul style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; padding-left: 20px;'>
                                    <li style='margin-bottom: 10px;'>A priest will visit the location at the scheduled time</li>
                                    <li style='margin-bottom: 10px;'>Please ensure someone will be present to receive the priest</li>
                                    <li style='margin-bottom: 10px;'>Please have a small table with a clean white cloth, crucifix, and candle if possible</li>
                                    <li style='margin-bottom: 10px;'>For emergency cases, please call the parish office directly</li>
                                </ul>
                            </div>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 30px;'>If you have any questions, please contact our parish office.</p>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 40px;'>God bless,<br><strong style='color: #573901;'>Parish of Divine Mercy</strong><br>Anointing of the Sick Ministry</p>
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

            $mail->AltBody = "Dear {$fullName},\n\n" .
                "Thank you for submitting your Anointing of the Sick application to the Parish of Divine Mercy.\n" .
                "Your request is currently PENDING for review by our parish office.\n\n" .
                "Request Details:\n" .
                "Sick Person's Name: {$sickPersonName}\n" .
                "Date: {$anointingDate}\n" .
                "Time: {$anointingTime}\n" .
                "Location: {$location}\n" .
                "Address: {$address}\n" .
                "Status: PENDING\n\n" .
                "Our parish staff will review your request. You will receive another email once approved.\n\n" .
                "God bless,\nParish of Divine Mercy";

            $mail->send();
            $response = ["success" => true, "message" => "Email sent successfully"];
        } catch (Exception $e) {
            $response = ["success" => false, "message" => "Mailer Error: " . $mail->ErrorInfo];
        }
    } else {
        $response = ["success" => false, "message" => "Client not found"];
    }
    $stmt->close();
}

$conn->close();
echo json_encode($response); 