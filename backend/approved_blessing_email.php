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
        error_log("[BLESSING_EMAIL_ERROR] " . $message);
    }
    
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Get and parse JSON data
        $jsonData = file_get_contents("php://input");
        $data = json_decode($jsonData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            handleError("Invalid JSON format: " . json_last_error_msg());
        }
    
        // Log received data for debugging
        error_log("Received blessing approval email request: " . $jsonData);
    
        // Validate input data
        if (!isset($data['blessingID']) || empty($data['blessingID'])) {
            handleError("Blessing ID is required");
        }
        
        $blessingID = $data['blessingID'];
        
        // Get the client ID associated with the blessing
        $stmt = $conn->prepare("SELECT clientID FROM blessing_application WHERE blessingID = ?");
        if (!$stmt) {
            handleError("Prepare statement failed", $conn->error);
        }
        
        $stmt->bind_param("i", $blessingID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows == 0) {
            handleError("No blessing record found with ID: " . $blessingID);
        }
        
        $blessingInfo = $result->fetch_assoc();
        $clientID = $blessingInfo['clientID'];
        
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
        
        error_log('[BLESSING_EMAIL] Preparing to send approval email to: ' . $userEmail . ' (' . $fullName . ')');

        // Get the blessing details
        $stmt = $conn->prepare("
            SELECT b.firstName, b.middleName, b.lastName, b.preferredDate, b.preferredTime, b.priestName,
                bt.blessing_type, bt.purpose, bt.note,
                ba.street, ba.barangay, ba.municipality, ba.province
            FROM blessing_application b 
            JOIN blessing_type bt ON b.blessingID = bt.blessingID
            JOIN blessing_address ba ON b.blessingID = ba.blessingID
            WHERE b.blessingID = ?");
        if (!$stmt) {
            handleError("Prepare statement failed", $conn->error);
        }
        
        $stmt->bind_param("i", $blessingID);
        $stmt->execute();
        $blessingResult = $stmt->get_result();
        
        if ($blessingResult->num_rows == 0) {
            handleError("Blessing details not found for ID: " . $blessingID);
        }
        
        $blessingData = $blessingResult->fetch_assoc();
        
        // Create new PHPMailer instance
        $mail = new PHPMailer(true);

        try {
            error_log('[BLESSING_EMAIL] Configuring PHPMailer...');
            // Server settings
            $mail->SMTPDebug = 2;
            $mail->Debugoutput = function($str, $level) { error_log('PHPMailer: ' . $str); };
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'parishofdivinemercy@gmail.com';
            $mail->Password   = 'scdq scnf milp uson'; // Your App Password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            error_log('[BLESSING_EMAIL] Setting From/To...');
            $mail->setFrom('parishofdivinemercy@gmail.com', 'Parish of Divine Mercy');
            $mail->addAddress($userEmail, $fullName);

            // Format the date for display
            $blessingDate = isset($blessingData['preferredDate']) ? date('F j, Y', strtotime($blessingData['preferredDate'])) : '';
            $blessingTime = isset($blessingData['preferredTime']) ? $blessingData['preferredTime'] : '';
            $priest = isset($blessingData['priestName']) ? $blessingData['priestName'] : '';
            $blessingType = isset($blessingData['blessing_type']) ? ucfirst($blessingData['blessing_type']) . ' Blessing' : '';
            $purpose = isset($blessingData['purpose']) ? $blessingData['purpose'] : '';
            $note = isset($blessingData['note']) ? $blessingData['note'] : '';
            
            // Format the address
            $location = trim(
                ($blessingData['street'] ?? '') . ', ' . 
                ($blessingData['barangay'] ?? '') . ', ' . 
                ($blessingData['municipality'] ?? '') . ', ' . 
                ($blessingData['province'] ?? '')
            );

            // Email content with matching color scheme
            $mail->isHTML(true);
            $mail->Subject = 'Blessing Application APPROVED - Parish of Divine Mercy';
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
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>We are pleased to inform you that your <b>{$blessingType} Application</b> for the Parish of Divine Mercy has been <strong style='color: #28a745;'>APPROVED</strong>!</p>
                            
                            <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;'>
                                <h3 style='color: #573901; font-family: Montserrat, sans-serif; margin-top: 0; font-size: 18px;'>Blessing Details:</h3>
                                <table style='width: 100%; font-family: Roboto, sans-serif; color: #000;'>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Blessing Type:</td>
                                        <td style='padding: 8px 0;'>{$blessingType}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Purpose:</td>
                                        <td style='padding: 8px 0;'>{$purpose}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Date:</td>
                                        <td style='padding: 8px 0;'>{$blessingDate}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Time:</td>
                                        <td style='padding: 8px 0;'>{$blessingTime}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Location:</td>
                                        <td style='padding: 8px 0;'>{$location}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Priest:</td>
                                        <td style='padding: 8px 0;'>{$priest}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Status:</td>
                                        <td style='padding: 8px 0;'><span style='background-color: #d4edda; color: #155724; padding: 4px 12px; border-radius: 4px; font-weight: bold;'>APPROVED</span></td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 20px;'>Please ensure you are at the location at least 30 minutes before the scheduled time. After the blessing ceremony, a certificate will be available for download through our website.</p>
                            
                            <div style='margin-top: 30px;'>
                                <h3 style='color: #573901; font-family: Montserrat, sans-serif; font-size: 18px;'>What to Prepare:</h3>
                                <ul style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; padding-left: 20px;'>";
            
            // Add blessing type specific preparations
            switch($blessingData['blessing_type']) {
                case 'house':
                    $mail->Body .= "
                                    <li style='margin-bottom: 10px;'>The house should be clean and ready for occupancy</li>
                                    <li style='margin-bottom: 10px;'>All family members should be present if possible</li>
                                    <li style='margin-bottom: 10px;'>Prepare basic blessing items (holy water will be provided by the priest)</li>";
                    break;
                case 'business':
                    $mail->Body .= "
                                    <li style='margin-bottom: 10px;'>The business premises should be ready and clean</li>
                                    <li style='margin-bottom: 10px;'>Owner or authorized representative must be present</li>
                                    <li style='margin-bottom: 10px;'>Staff may be included in the prayer or ceremony</li>";
                    break;
                case 'car':
                    $mail->Body .= "
                                    <li style='margin-bottom: 10px;'>The vehicle should be clean and parked properly at the venue</li>
                                    <li style='margin-bottom: 10px;'>Bring the actual vehicle to be blessed</li>
                                    <li style='margin-bottom: 10px;'>Owner should be present during the blessing</li>";
                    break;
                default:
                    $mail->Body .= "
                                    <li style='margin-bottom: 10px;'>Please prepare the location for the blessing</li>
                                    <li style='margin-bottom: 10px;'>Ensure all relevant parties are present</li>";
            }
            
            $mail->Body .= "
                                </ul>
                            </div>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 30px;'>If you have any questions, please contact our parish office.</p>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 40px;'>God bless,<br><strong style='color: #573901;'>Parish of Divine Mercy</strong><br>Blessing Ministry</p>
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
                "We are pleased to inform you that your {$blessingType} Application for the Parish of Divine Mercy has been APPROVED!\n\n" .
                "Blessing Details:\n" .
                "Blessing Type: {$blessingType}\n" .
                "Purpose: {$purpose}\n" .
                "Date: {$blessingDate}\n" .
                "Time: {$blessingTime}\n" .
                "Location: {$location}\n" .
                "Priest: {$priest}\n" .
                "Status: APPROVED\n\n" .
                "Please ensure you are at the location at least 30 minutes before the scheduled time.\n\n" .
                "God bless,\nParish of Divine Mercy\nBlessing Ministry";

            error_log('[BLESSING_EMAIL] Attempting to send email...');
            if ($mail->send()) {
                error_log('[BLESSING_EMAIL] Email sent successfully to: ' . $userEmail);
                $response["success"] = true;
                $response["message"] = "Approval email has been sent to " . htmlspecialchars($userEmail);
            } else {
                error_log('[BLESSING_EMAIL] Email send failed: ' . $mail->ErrorInfo);
                handleError("Email not sent", $mail->ErrorInfo);
            }
        } catch (Exception $e) {
            error_log('[BLESSING_EMAIL] Exception: ' . $e->getMessage());
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