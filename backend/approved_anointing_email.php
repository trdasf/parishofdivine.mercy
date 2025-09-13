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
        error_log("[ANOINTING_EMAIL_ERROR] " . $message);
    }
    
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Get and parse JSON data
        $jsonData = file_get_contents("php://input");
        $data = json_decode($jsonData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            handleError("Invalid JSON format: " . json_last_error_msg());
        }
    
        // Log received data for debugging
        error_log("Received anointing approval email request: " . $jsonData);
    
        // Validate input data
        if (!isset($data['anointingID']) || empty($data['anointingID'])) {
            handleError("Anointing ID is required");
        }
        
        $anointingID = $data['anointingID'];
        
        // Get the client ID associated with the anointing
        $stmt = $conn->prepare("SELECT clientID FROM anointing_application WHERE anointingID = ?");
        if (!$stmt) {
            handleError("Prepare statement failed", $conn->error);
        }
        
        $stmt->bind_param("i", $anointingID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows == 0) {
            handleError("No anointing record found with ID: " . $anointingID);
        }
        
        $anointingInfo = $result->fetch_assoc();
        $clientID = $anointingInfo['clientID'];
        
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
        
        error_log('[ANOINTING_EMAIL] Preparing to send approval email to: ' . $userEmail . ' (' . $fullName . ')');

        // Get the anointing details (patient info, location, contact info, etc.)
        $stmt = $conn->prepare("
            SELECT a.firstName, a.lastName,
                   l.locationType, l.locationName, l.roomNumber, l.street, l.barangay, l.municipality, l.province,
                   c.contactFirstName, c.contactLastName, c.contactPhone
            FROM anointing_application a
            LEFT JOIN anointing_location l ON a.anointingID = l.anointingID
            LEFT JOIN anointing_contactinfo c ON a.anointingID = c.anointingID
            WHERE a.anointingID = ?");
        if (!$stmt) {
            handleError("Prepare statement failed", $conn->error);
        }
        
        $stmt->bind_param("i", $anointingID);
        $stmt->execute();
        $anointingResult = $stmt->get_result();
        
        if ($anointingResult->num_rows == 0) {
            handleError("Anointing details not found for ID: " . $anointingID);
        }
        
        $anointingData = $anointingResult->fetch_assoc();

        // Get the approved appointment details
        $stmt = $conn->prepare("
            SELECT date, time, priest 
            FROM approved_appointments 
            WHERE sacramentID = ? AND sacrament_type = 'anointing'");
        
        if (!$stmt) {
            handleError("Prepare statement failed for appointment query", $conn->error);
        }
        
        $stmt->bind_param("i", $anointingID);
        $stmt->execute();
        $appointmentResult = $stmt->get_result();
        
        if ($appointmentResult->num_rows == 0) {
            handleError("Approved appointment details not found for anointing ID: " . $anointingID);
        }
        
        $appointmentData = $appointmentResult->fetch_assoc();
        
        // Create new PHPMailer instance
        $mail = new PHPMailer(true);

        try {
            error_log('[ANOINTING_EMAIL] Configuring PHPMailer...');
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

            error_log('[ANOINTING_EMAIL] Setting From/To...');
            $mail->setFrom('parishofdivinemercy@gmail.com', 'Parish of Divine Mercy');
            $mail->addAddress($userEmail, $fullName);

            // CORRECTED: Format the date for display (December 23, 2025 format)
            $anointingDate = isset($appointmentData['date']) ? 
                date('F j, Y', strtotime($appointmentData['date'])) : '';
            
            // CORRECTED: Format time to 12-hour format with AM/PM (3:00 PM format)
            $anointingTime = '';
            if (isset($appointmentData['time']) && !empty($appointmentData['time'])) {
                // Convert 24-hour format to 12-hour format with AM/PM
                $timeObj = DateTime::createFromFormat('H:i:s', $appointmentData['time']);
                if ($timeObj) {
                    $anointingTime = $timeObj->format('g:i A'); // e.g., "3:00 PM"
                } else {
                    // Fallback: try without seconds
                    $timeObj = DateTime::createFromFormat('H:i', $appointmentData['time']);
                    if ($timeObj) {
                        $anointingTime = $timeObj->format('g:i A');
                    } else {
                        $anointingTime = $appointmentData['time']; // Use original if conversion fails
                    }
                }
            }
            
            $priest = isset($appointmentData['priest']) ? $appointmentData['priest'] : '';
            
            // These remain from anointing data since they don't change
            $patientName = trim(($anointingData['firstName'] ?? '') . ' ' . 
                        ($anointingData['lastName'] ?? ''));
                        
            $location = '';
            if (isset($anointingData['locationType']) && $anointingData['locationType'] == 'Hospital') {
                $location = $anointingData['locationName'] . ', ' . $anointingData['roomNumber'];
            } else {
                $location = $anointingData['street'] . ', ' . $anointingData['barangay'] . ', ' . 
                           $anointingData['municipality'] . ', ' . $anointingData['province'];
            }
            
            $contactPerson = trim(($anointingData['contactFirstName'] ?? '') . ' ' . 
                             ($anointingData['contactLastName'] ?? ''));
            $contactPhone = $anointingData['contactPhone'] ?? '';

            // Email content with matching color scheme - UPDATED MESSAGING
            $mail->isHTML(true);
            $mail->Subject = 'Anointing of the Sick Application APPROVED - Parish of Divine Mercy';
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
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>We are pleased to inform you that your <b>Anointing of the Sick Application</b> for the Parish of Divine Mercy has been <strong style='color: #28a745;'>APPROVED</strong>!</p>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>A priest from our parish has been scheduled to visit at the date and time indicated below:</p>
                            
                            <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;'>
                                <h3 style='color: #573901; font-family: Montserrat, sans-serif; margin-top: 0; font-size: 18px;'>Anointing Visit Details:</h3>
                                <table style='width: 100%; font-family: Roboto, sans-serif; color: #000;'>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Patient's Name:</td>
                                        <td style='padding: 8px 0;'>{$patientName}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Visit Date:</td>
                                        <td style='padding: 8px 0;'><strong>{$anointingDate}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Visit Time:</td>
                                        <td style='padding: 8px 0;'><strong>{$anointingTime}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Officiating Priest:</td>
                                        <td style='padding: 8px 0;'>{$priest}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Location:</td>
                                        <td style='padding: 8px 0;'>{$location}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Contact Person:</td>
                                        <td style='padding: 8px 0;'>{$contactPerson} - {$contactPhone}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Status:</td>
                                        <td style='padding: 8px 0;'><span style='background-color: #d4edda; color: #155724; padding: 4px 12px; border-radius: 4px; font-weight: bold;'>APPROVED</span></td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style='background-color: #e9f7ef; border: 1px solid #b8e6c1; border-radius: 8px; padding: 15px; margin: 20px 0;'>
                                <p style='color: #0f5132; font-family: Roboto, sans-serif; font-size: 14px; margin: 0; font-weight: 500;'>
                                    <strong>Important:</strong> Please ensure someone will be available to receive the priest at the scheduled time. If there are any changes needed, please contact our parish office immediately.
                                </p>
                            </div>
                            
                            <div style='margin-top: 30px;'>
                                <h3 style='color: #573901; font-family: Montserrat, sans-serif; font-size: 18px;'>Preparation Guidelines:</h3>
                                <ul style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; padding-left: 20px;'>
                                    <li style='margin-bottom: 10px;'>If possible, prepare a small table with a white cloth</li>
                                    <li style='margin-bottom: 10px;'>Place a crucifix or religious image if available</li>
                                    <li style='margin-bottom: 10px;'>Have a small bowl of holy water (the priest will bring some if needed)</li>
                                    <li style='margin-bottom: 10px;'>A candle may be placed on the table (optional)</li>
                                    <li style='margin-bottom: 10px;'>Ensure the space is quiet and suitable for prayer</li>
                                </ul>
                            </div>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 20px;'>The Anointing of the Sick is a sacred sacrament that brings spiritual healing and comfort. We ask for your prayers for the patient during this blessed time.</p>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 30px;'>If you have any questions or need to make changes to the appointment, please contact our parish office immediately.</p>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 40px;'>May God's healing grace be with you and your loved ones.<br><br>God bless,<br><strong style='color: #573901;'>Parish of Divine Mercy</strong><br>Anointing Ministry</p>
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
                "We are pleased to inform you that your Anointing of the Sick Application for the Parish of Divine Mercy has been APPROVED!\n\n" .
                "A priest from our parish has been scheduled to visit at the date and time indicated below:\n\n" .
                "Anointing Visit Details:\n" .
                "Patient's Name: {$patientName}\n" .
                "Visit Date: {$anointingDate}\n" .
                "Visit Time: {$anointingTime}\n" .
                "Officiating Priest: {$priest}\n" .
                "Location: {$location}\n" .
                "Contact Person: {$contactPerson} - {$contactPhone}\n" .
                "Status: APPROVED\n\n" .
                "IMPORTANT: Please ensure someone will be available to receive the priest at the scheduled time.\n\n" .
                "Preparation Guidelines:\n" .
                "- If possible, prepare a small table with a white cloth\n" .
                "- Place a crucifix or religious image if available\n" .
                "- Have a small bowl of holy water (the priest will bring some if needed)\n" .
                "- A candle may be placed on the table (optional)\n" .
                "- Ensure the space is quiet and suitable for prayer\n\n" .
                "The Anointing of the Sick is a sacred sacrament that brings spiritual healing and comfort. We ask for your prayers for the patient during this blessed time.\n\n" .
                "May God's healing grace be with you and your loved ones.\n\n" .
                "God bless,\nParish of Divine Mercy\nAnointing Ministry";

            error_log('[ANOINTING_EMAIL] Attempting to send email...');
            if ($mail->send()) {
                error_log('[ANOINTING_EMAIL] Email sent successfully to: ' . $userEmail);
                $response["success"] = true;
                $response["message"] = "Approval email has been sent to " . htmlspecialchars($userEmail);
            } else {
                error_log('[ANOINTING_EMAIL] Email send failed: ' . $mail->ErrorInfo);
                handleError("Email not sent", $mail->ErrorInfo);
            }
        } catch (Exception $e) {
            error_log('[ANOINTING_EMAIL] Exception: ' . $e->getMessage());
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
?>