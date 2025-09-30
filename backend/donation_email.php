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

// Include PHPMailer
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
    
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Get and parse JSON data
        $jsonData = file_get_contents("php://input");
        $data = json_decode($jsonData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            handleError("Invalid JSON format: " . json_last_error_msg());
        }
    
        // Log received data for debugging
        error_log("Received donation confirmation email request: " . $jsonData);
    
        // Validate input data
        if (!isset($data['donationID']) || empty($data['donationID'])) {
            handleError("Donation ID is required");
        }
        
        $donationID = $data['donationID'];
        
        // Get the donation details from the database using the correct column names
        // Note: Assuming the primary key column is 'id' since donationID wasn't in your column list
        $stmt = $conn->prepare("
            SELECT 
                donationID,
                clientID,
                date_of_donation,
                time_of_donation,
                full_name,
                contact_number,
                email,
                home_address,
                donation_amount,
                reference_number,
                mass_intention,
                purpose,
                intention
            FROM donations
            WHERE donationID = ?
        ");
        
        if (!$stmt) {
            handleError("Prepare statement failed", $conn->error);
        }
        
        $stmt->bind_param("i", $donationID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows == 0) {
            handleError("No donation record found with ID: " . $donationID);
        }
        
        $donationInfo = $result->fetch_assoc();
        
        $userEmail = $donationInfo['email'];
        $fullName = $donationInfo['full_name'];
        $donationAmount = "₱" . number_format($donationInfo['donation_amount'], 2);
        $purpose = $donationInfo['purpose'];
        $referenceNumber = $donationInfo['reference_number'];
        $massIntention = $donationInfo['mass_intention'];
        $intentionType = $donationInfo['intention'];
        
        // Format date and time
        $donationDate = date('F j, Y', strtotime($donationInfo['date_of_donation']));
        
        // Format time to 12-hour format with AM/PM
        $donationTime = '';
        if (!empty($donationInfo['time_of_donation'])) {
            $timeObj = DateTime::createFromFormat('H:i:s', $donationInfo['time_of_donation']);
            if ($timeObj) {
                $donationTime = $timeObj->format('g:i A');
            } else {
                $timeObj = DateTime::createFromFormat('H:i', $donationInfo['time_of_donation']);
                if ($timeObj) {
                    $donationTime = $timeObj->format('g:i A');
                } else {
                    $donationTime = $donationInfo['time_of_donation'];
                }
            }
        }
        
        error_log('[DONATION_EMAIL] Preparing to send confirmation email to: ' . $userEmail . ' (' . $fullName . ')');

        // Create new PHPMailer instance
        $mail = new PHPMailer(true);

        try {
            error_log('[DONATION_EMAIL] Configuring PHPMailer...');
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

            error_log('[DONATION_EMAIL] Setting From/To...');
            $mail->setFrom('parishofdivinemercy@gmail.com', 'Parish of Divine Mercy');
            $mail->addAddress($userEmail, $fullName);

            // Determine if we should show mass intention section
            $showMassIntention = false;
            $massIntentionText = '';
            
            // Only show mass intention if:
            // 1. The purpose is "Mass Intention" 
            // 2. AND there's actually a mass intention (name of person) provided
            if (stripos($purpose, 'Mass Intention') !== false && !empty($massIntention)) {
                $showMassIntention = true;
                $massIntentionText = $massIntention;
                if (!empty($intentionType)) {
                    $massIntentionText = $intentionType . " for " . $massIntention;
                }
            }

            // Email content with matching color scheme
            $mail->isHTML(true);
            $mail->Subject = 'Donation Confirmation - Parish of Divine Mercy';
            $mail->Body = "
                <html>
                <body style='font-family: Roboto, Arial, sans-serif; line-height: 1.6; color: #000; margin: 0; padding: 0;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>
                        <div style='background-color: #573901; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;'>
                            <h1 style='color: white; margin: 0; font-family: Montserrat, sans-serif; font-size: 24px; letter-spacing: 1px;'>PARISH OF THE DIVINE MERCY</h1>
                        </div>
                        
                        <div style='background: linear-gradient(to right, #710808, #ffcccc); height: 4px; width: 100%;'></div>
                        
                        <div style='padding: 30px 20px; background-color: #fff;'>
                            <h2 style='color: #573901; font-family: Montserrat, sans-serif; margin-bottom: 20px;'>Dear {$fullName},</h2>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-bottom: 20px;'>
                                On behalf of the Parish of the Divine Mercy, we sincerely thank you for your generous donation of <strong>{$donationAmount}</strong>, received on <strong>{$donationDate}</strong> at <strong>{$donationTime}</strong>.
                            </p>
                            
                            <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e0e0e0;'>
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 14px; line-height: 1.8; margin: 0;'>
                                    Your contribution, given under the purpose \"<strong>{$purpose}</strong>\", will greatly help in supporting our parish programs and ministries. We also acknowledge your reference number <strong>{$referenceNumber}</strong> for record purposes.
                                    <br><br>
                                    " . ($showMassIntention ? "If you have requested a Mass Intention, please be assured that your intention \"<strong>{$massIntentionText}</strong>\" will be included in our parish prayers.<br><br>" : "") . "
                                    Your kindness and generosity enable us to continue serving our community through worship, outreach, and pastoral care.
                                    <br><br>
                                    May the Lord bless you abundantly for your selfless support.
                                    <br><br>
                                    With gratitude,<br>
                                    <strong>Parish of the Divine Mercy</strong><br>
                                    Management Information System
                                </p>
                            </div>
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
                "On behalf of the Parish of the Divine Mercy, we sincerely thank you for your generous donation of {$donationAmount}, received on {$donationDate} at {$donationTime}.\n\n" .
                "Your contribution, given under the purpose \"{$purpose}\", will greatly help in supporting our parish programs and ministries. We also acknowledge your reference number {$referenceNumber} for record purposes.\n\n" .
                ($showMassIntention ? "If you have requested a Mass Intention, please be assured that your intention \"{$massIntentionText}\" will be included in our parish prayers.\n\n" : "") .
                "Your kindness and generosity enable us to continue serving our community through worship, outreach, and pastoral care.\n\n" .
                "May the Lord bless you abundantly for your selfless support.\n\n" .
                "With gratitude,\nParish of the Divine Mercy\nManagement Information System";

            error_log('[DONATION_EMAIL] Attempting to send email...');
            if ($mail->send()) {
                error_log('[DONATION_EMAIL] Email sent successfully to: ' . $userEmail);
                $response["success"] = true;
                $response["message"] = "Donation confirmation email has been sent to " . htmlspecialchars($userEmail);
            } else {
                error_log('[DONATION_EMAIL] Email send failed: ' . $mail->ErrorInfo);
                handleError("Email not sent", $mail->ErrorInfo);
            }
        } catch (Exception $e) {
            error_log('[DONATION_EMAIL] Exception: ' . $e->getMessage());
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