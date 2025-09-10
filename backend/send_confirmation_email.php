<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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

    // Access the confirmationData directly as it's sent from frontend
    $confirmationData = $data['confirmationData'];
    
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
            $mail->Subject = 'Confirmation Appointment Request Pending - Parish of Divine Mercy';

            // Use the data directly from frontend
            $confirmationDate = $confirmationData['date'] ? date('F j, Y', strtotime($confirmationData['date'])) : '';
            
            // Format time to 12-hour format with AM/PM
            $confirmationTime = '';
            if (isset($confirmationData['time']) && !empty($confirmationData['time'])) {
                // Convert 24-hour format to 12-hour format with AM/PM
                $timeObj = DateTime::createFromFormat('H:i:s', $confirmationData['time']);
                if ($timeObj) {
                    $confirmationTime = $timeObj->format('g:i A'); // e.g., "3:00 PM"
                } else {
                    // Fallback: try without seconds
                    $timeObj = DateTime::createFromFormat('H:i', $confirmationData['time']);
                    if ($timeObj) {
                        $confirmationTime = $timeObj->format('g:i A');
                    } else {
                        $confirmationTime = $confirmationData['time']; // Use original if conversion fails
                    }
                }
            }
            
            // Directly use the names from the form - no processing
            $first_name = $confirmationData['first_name'] ?? '';
            $middle_name = $confirmationData['middle_name'] ?? '';
            $last_name = $confirmationData['last_name'] ?? '';
            $candidateName = trim("$first_name $middle_name $last_name");
            
            $status = "PENDING";

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
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>Thank you for submitting your <b>Confirmation Appointment Request</b> to the Parish of Divine Mercy.</p>
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>Your appointment request is currently <strong style='color: #b3701f;'>PENDING</strong> for review by our parish office.</p>
                            <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #710808;'>
                                <h3 style='color: #573901; font-family: Montserrat, sans-serif; margin-top: 0; font-size: 18px;'>Appointment Request Details:</h3>
                                <table style='width: 100%; font-family: Roboto, sans-serif; color: #000;'>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Candidate's Name:</td>
                                        <td style='padding: 8px 0;'>{$candidateName}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Requested Date:</td>
                                        <td style='padding: 8px 0;'>{$confirmationDate}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Requested Time:</td>
                                        <td style='padding: 8px 0;'>{$confirmationTime}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Status:</td>
                                        <td style='padding: 8px 0;'><span style='background-color: #f8d7da; color: #721c24; padding: 4px 12px; border-radius: 4px; font-weight: bold;'>{$status}</span></td>
                                    </tr>
                                </table>
                            </div>
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 20px;'>Our parish staff will review your appointment request and documents. You will receive another email once your appointment has been approved or if additional information is needed.</p>
                            
                            <div style='background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;'>
                                <p style='color: #856404; font-family: Roboto, sans-serif; font-size: 14px; margin: 0; font-weight: 500;'>
                                    <strong>Please Note:</strong> This is for an appointment scheduling only. The actual Confirmation ceremony will be scheduled after your appointment is approved and all preparation requirements are completed.
                                </p>
                            </div>
                            
                            <div style='margin-top: 30px;'>
                                <h3 style='color: #573901; font-family: Montserrat, sans-serif; font-size: 18px;'>Next Steps for Your Appointment:</h3>
                                <ul style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; padding-left: 20px;'>
                                    <li style='margin-bottom: 10px;'>Wait for the approval email from our parish office</li>
                                    <li style='margin-bottom: 10px;'>Prepare all original documents for verification during your appointment</li>
                                    <li style='margin-bottom: 10px;'>Attend the Confirmation Seminar (details will be provided upon approval)</li>
                                    <li style='margin-bottom: 10px;'>Complete all preparation requirements before the ceremony can be scheduled</li>
                                    <li style='margin-bottom: 10px;'>Please arrive at least 15 minutes before your appointment time</li>
                                </ul>
                            </div>
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 30px;'>If you have any questions, please contact our parish office.</p>
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 40px;'>God bless,<br><strong style='color: #573901;'>Parish of Divine Mercy</strong><br>Confirmation Ministry</p>
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

            $mail->AltBody = "Dear {$fullName},\n\n" .
                "Thank you for submitting your Confirmation Appointment Request to the Parish of Divine Mercy.\n" .
                "Your appointment request is currently PENDING for review by our parish office.\n\n" .
                "Appointment Request Details:\n" .
                "Candidate's Name: {$candidateName}\n" .
                "Requested Date: {$confirmationDate}\n" .
                "Requested Time: {$confirmationTime}\n" .
                "Status: PENDING\n\n" .
                "Please Note: This is for an appointment scheduling only. The actual Confirmation ceremony will be scheduled after your appointment is approved and all preparation requirements are completed.\n\n" .
                "Our parish staff will review your appointment request. You will receive another email once approved.\n\n" .
                "God bless,\nParish of Divine Mercy";

            $mail->send();
            $response = ["success" => true, "message" => "Email sent"];
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