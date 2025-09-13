<?php
// Prevent any output before JSON response
ob_start();

// Enable error logging but disable displaying errors
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'funeral_email_errors.log'); // Add dedicated log file

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

// Function to validate email address
function isValidEmail($email) {
    if (empty($email)) {
        return false;
    }
    $email = trim($email);
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false && strlen($email) > 5;
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
        error_log("[FUNERAL_EMAIL_ERROR] " . $message);
    }
    
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Get and parse JSON data
        $jsonData = file_get_contents("php://input");
        $data = json_decode($jsonData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            handleError("Invalid JSON format: " . json_last_error_msg());
        }
    
        // Log received data for debugging
        error_log("Received funeral approval email request: " . $jsonData);
    
        // Validate input data
        if (!isset($data['funeralID']) || empty($data['funeralID'])) {
            handleError("Funeral ID is required");
        }
        
        $funeralID = $data['funeralID'];
        
        // Extract schedule information from request (if provided)
        $scheduledDate = isset($data['date']) ? $data['date'] : null;
        $scheduledTime = isset($data['time']) ? $data['time'] : null;
        $assignedPriest = isset($data['priest']) ? $data['priest'] : null;
        
        // Get the client ID associated with the funeral
        $stmt = $conn->prepare("SELECT clientID FROM funeral_mass_application WHERE funeralID = ?");
        if (!$stmt) {
            handleError("Prepare statement failed", $conn->error);
        }
        
        $stmt->bind_param("i", $funeralID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows == 0) {
            handleError("No funeral record found with ID: " . $funeralID);
        }
        
        $funeralInfo = $result->fetch_assoc();
        $clientID = $funeralInfo['clientID'];
        
        // Get client email if clientID exists
        $clientData = null;
        if ($clientID) {
            $stmt = $conn->prepare("SELECT email, first_name, last_name FROM client_registration WHERE clientID = ?");
            if ($stmt) {
                $stmt->bind_param("i", $clientID);
                $stmt->execute();
                $clientResult = $stmt->get_result();
                
                if ($clientResult->num_rows > 0) {
                    $clientData = $clientResult->fetch_assoc();
                    error_log('[FUNERAL_EMAIL] Client data found: ' . json_encode($clientData));
                }
            }
        }
        
        // Get funeral details
        $stmt = $conn->prepare("
            SELECT f.*, d.first_name as deceased_first_name, d.middle_name as deceased_middle_name, 
                   d.last_name as deceased_last_name
            FROM funeral_mass_application f
            LEFT JOIN deceased_info d ON f.funeralID = d.funeralID
            WHERE f.funeralID = ?");
        if (!$stmt) {
            handleError("Prepare statement failed", $conn->error);
        }
        
        $stmt->bind_param("i", $funeralID);
        $stmt->execute();
        $funeralResult = $stmt->get_result();
        
        if ($funeralResult->num_rows == 0) {
            handleError("Funeral details not found for ID: " . $funeralID);
        }
        
        $funeralData = $funeralResult->fetch_assoc();
        
        // Get requester information
        $stmt = $conn->prepare("SELECT * FROM requester_info WHERE funeralID = ?");
        if (!$stmt) {
            handleError("Prepare statement failed for requester query", $conn->error);
        }
        
        $stmt->bind_param("i", $funeralID);
        $stmt->execute();
        $requesterResult = $stmt->get_result();
        
        $requesterData = null;
        if ($requesterResult->num_rows > 0) {
            $requesterData = $requesterResult->fetch_assoc();
            error_log('[FUNERAL_EMAIL] Requester data found: ' . json_encode($requesterData));
        }
        
        // If date, time, or priest is not provided in the POST data, fetch from approved_appointments
        if (!$scheduledDate || !$scheduledTime || !$assignedPriest) {
            $stmt = $conn->prepare("
                SELECT date, time, priest 
                FROM approved_appointments 
                WHERE sacramentID = ? AND sacrament_type = 'Funeral'");
            if ($stmt) {
                $stmt->bind_param("i", $funeralID);
                $stmt->execute();
                $appointmentResult = $stmt->get_result();
                
                if ($appointmentResult->num_rows > 0) {
                    $appointmentData = $appointmentResult->fetch_assoc();
                    
                    // Only use these values if they weren't provided in the POST data
                    $scheduledDate = $scheduledDate ?: $appointmentData['date'];
                    $scheduledTime = $scheduledTime ?: $appointmentData['time'];
                    $assignedPriest = $assignedPriest ?: $appointmentData['priest'];
                } else {
                    // If no data in approved_appointments, fallback to funeral_mass_application
                    $scheduledDate = $scheduledDate ?: $funeralData['dateOfFuneralMass'];
                    $scheduledTime = $scheduledTime ?: $funeralData['timeOfFuneralMass'];
                    $assignedPriest = $assignedPriest ?: $funeralData['priestName'];
                }
            }
        }
        
        // Create new PHPMailer instance
        $mail = new PHPMailer(true);

        try {
            error_log('[FUNERAL_EMAIL] Configuring PHPMailer...');
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

            error_log('[FUNERAL_EMAIL] Setting From...');
            $mail->setFrom('parishofdivinemercy@gmail.com', 'Parish of Divine Mercy');
            
            $recipientFound = false;
            $recipientEmails = [];
            
            // Add client's email if available and valid
            if ($clientData && isset($clientData['email']) && !empty($clientData['email'])) {
                $clientEmail = trim($clientData['email']);
                error_log('[FUNERAL_EMAIL] Checking client email: "' . $clientEmail . '"');
                
                if (isValidEmail($clientEmail)) {
                    $clientName = trim(($clientData['first_name'] ?? '') . ' ' . ($clientData['last_name'] ?? ''));
                    $mail->addAddress($clientEmail, $clientName);
                    $recipientFound = true;
                    $recipientEmails[] = $clientEmail;
                    error_log("[FUNERAL_EMAIL] Added client email recipient: " . $clientEmail);
                } else {
                    error_log("[FUNERAL_EMAIL] Invalid client email format: '" . $clientEmail . "'");
                }
            } else {
                error_log('[FUNERAL_EMAIL] No client email found or clientID is null');
            }
            
            // Add requester's email if available, valid, and different from client
            if ($requesterData && isset($requesterData['email']) && !empty($requesterData['email'])) {
                $requesterEmail = trim($requesterData['email']);
                error_log('[FUNERAL_EMAIL] Checking requester email: "' . $requesterEmail . '"');
                
                if (isValidEmail($requesterEmail) && !in_array($requesterEmail, $recipientEmails)) {
                    $requesterName = trim(($requesterData['first_name'] ?? '') . ' ' . ($requesterData['last_name'] ?? ''));
                    $mail->addAddress($requesterEmail, $requesterName);
                    $recipientFound = true;
                    $recipientEmails[] = $requesterEmail;
                    error_log("[FUNERAL_EMAIL] Added requester email recipient: " . $requesterEmail);
                } else {
                    if (!isValidEmail($requesterEmail)) {
                        error_log("[FUNERAL_EMAIL] Invalid requester email format: '" . $requesterEmail . "'");
                    } else {
                        error_log("[FUNERAL_EMAIL] Requester email is duplicate: '" . $requesterEmail . "'");
                    }
                }
            } else {
                error_log('[FUNERAL_EMAIL] No requester email found');
            }
            
            // If no valid recipients were found, report error
            if (!$recipientFound) {
                throw new Exception("No valid email recipients found for funeralID: " . $funeralID);
            }
            
            // CORRECTED: Format the date for display (December 23, 2025 format)
            $funeralDate = 'TBD';
            if ($scheduledDate) {
                $funeralDate = date('F j, Y', strtotime($scheduledDate));
            }
            
            // CORRECTED: Format time to 12-hour format with AM/PM (3:00 PM format)
            $funeralTime = 'TBD';
            if ($scheduledTime && !empty($scheduledTime)) {
                // Convert 24-hour format to 12-hour format with AM/PM
                $timeObj = DateTime::createFromFormat('H:i:s', $scheduledTime);
                if ($timeObj) {
                    $funeralTime = $timeObj->format('g:i A'); // e.g., "3:00 PM"
                } else {
                    // Fallback: try without seconds
                    $timeObj = DateTime::createFromFormat('H:i', $scheduledTime);
                    if ($timeObj) {
                        $funeralTime = $timeObj->format('g:i A');
                    } else {
                        // Fallback: try with strtotime (original method)
                        $timeFromStrtotime = date('g:i A', strtotime($scheduledTime));
                        $funeralTime = $timeFromStrtotime !== false ? $timeFromStrtotime : $scheduledTime;
                    }
                }
            }
            
            $priestName = $assignedPriest ?: 'TBD';
            
            // Full name of deceased
            $deceasedName = trim(($funeralData['deceased_first_name'] ?? '') . ' ' . 
                           ($funeralData['deceased_middle_name'] ? $funeralData['deceased_middle_name'] . ' ' : '') . 
                           ($funeralData['deceased_last_name'] ?? ''));
            
            if (empty($deceasedName)) {
                $deceasedName = 'Beloved Departed';
            }
            
            // Client or requester name for greeting
            $recipientName = 'Valued Parishioner';
            if ($clientData && isset($clientData['first_name'])) {
                $recipientName = trim(($clientData['first_name'] ?? '') . ' ' . ($clientData['last_name'] ?? ''));
            } elseif ($requesterData && isset($requesterData['first_name'])) {
                $recipientName = trim(($requesterData['first_name'] ?? '') . ' ' . ($requesterData['last_name'] ?? ''));
            }
            
            if (empty($recipientName) || $recipientName === ' ') {
                $recipientName = 'Valued Parishioner';
            }

            // Email content with matching color scheme - UPDATED MESSAGING
            $mail->isHTML(true);
            $mail->Subject = 'Funeral Mass Application APPROVED - Parish of Divine Mercy';
            $mail->Body = "
                <html>
                <body style='font-family: Roboto, Arial, sans-serif; line-height: 1.6; color: #000; margin: 0; padding: 0;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>
                        <div style='background-color: #573901; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;'>
                            <h1 style='color: white; margin: 0; font-family: Montserrat, sans-serif; font-size: 24px; letter-spacing: 1px;'>Parish of Divine Mercy</h1>
                        </div>
                        
                        <div style='background: linear-gradient(to right, #710808, #ffcccc); height: 4px; width: 100%;'></div>
                        
                        <div style='padding: 30px 20px; background-color: #fff;'>
                            <h2 style='color: #573901; font-family: Montserrat, sans-serif; margin-bottom: 20px;'>Dear {$recipientName},</h2>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>We are writing to inform you that your <b>Funeral Mass Application</b> for the Parish of Divine Mercy has been <strong style='color: #28a745;'>APPROVED</strong>.</p>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>The funeral mass has been scheduled for the date and time indicated below:</p>
                            
                            <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;'>
                                <h3 style='color: #573901; font-family: Montserrat, sans-serif; margin-top: 0; font-size: 18px;'>Funeral Mass Details:</h3>
                                <table style='width: 100%; font-family: Roboto, sans-serif; color: #000;'>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Deceased:</td>
                                        <td style='padding: 8px 0;'>{$deceasedName}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Mass Date:</td>
                                        <td style='padding: 8px 0;'><strong>{$funeralDate}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Mass Time:</td>
                                        <td style='padding: 8px 0;'><strong>{$funeralTime}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Celebrating Priest:</td>
                                        <td style='padding: 8px 0;'>{$priestName}</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Location:</td>
                                        <td style='padding: 8px 0;'>Parish of Divine Mercy, Alawihao, Daet</td>
                                    </tr>
                                    <tr>
                                        <td style='padding: 8px 0; font-weight: 500;'>Status:</td>
                                        <td style='padding: 8px 0;'><span style='background-color: #d4edda; color: #155724; padding: 4px 12px; border-radius: 4px; font-weight: bold;'>APPROVED</span></td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style='background-color: #e9f7ef; border: 1px solid #b8e6c1; border-radius: 8px; padding: 15px; margin: 20px 0;'>
                                <p style='color: #0f5132; font-family: Roboto, sans-serif; font-size: 14px; margin: 0; font-weight: 500;'>
                                    <strong>Important:</strong> Please arrive at the church at least 30 minutes before the scheduled mass time. This allows time for final preparations and coordination with our funeral ministry team.
                                </p>
                            </div>
                            
                            <div style='margin-top: 20px;'>
                                <h3 style='color: #573901; font-family: Montserrat, sans-serif; font-size: 18px;'>Important Reminders for the Funeral Mass:</h3>
                                <ul style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; padding-left: 20px;'>
                                    <li style='margin-bottom: 10px;'>Bring all original documents for final verification</li>
                                    <li style='margin-bottom: 10px;'>Photos/memorial displays are allowed but not on the altar area</li>
                                    <li style='margin-bottom: 10px;'>Eulogies may be given before/after the Mass or at the cemetery</li>
                                    <li style='margin-bottom: 10px;'>Proper and modest attire is required for all attendees</li>
                                    <li style='margin-bottom: 10px;'>Please coordinate with funeral home regarding flowers and arrangements</li>
                                    <li style='margin-bottom: 10px;'>Mass cards and memorial donations can be arranged through the parish office</li>
                                </ul>
                            </div>
                            
                            <div style='margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #573901;'>
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin: 0; font-style: italic;'>\"Eternal rest grant unto them, O Lord, and let perpetual light shine upon them. May they rest in peace. Amen.\"</p>
                            </div>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 30px;'>If you have any questions or need to make any changes, please contact our parish office immediately.</p>
                            
                            <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 40px;'>Our prayers are with you and your family during this difficult time.<br><br>With deepest sympathy,<br><strong style='color: #573901;'>Parish of Divine Mercy</strong><br>Funeral Ministry</p>
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
            $mail->AltBody = "Dear {$recipientName},\n\n" .
                "We are writing to inform you that your Funeral Mass Application for the Parish of Divine Mercy has been APPROVED.\n\n" .
                "The funeral mass has been scheduled for the date and time indicated below:\n\n" .
                "Funeral Mass Details:\n" .
                "Deceased: {$deceasedName}\n" .
                "Mass Date: {$funeralDate}\n" .
                "Mass Time: {$funeralTime}\n" .
                "Celebrating Priest: {$priestName}\n" .
                "Location: Parish of Divine Mercy, Alawihao, Daet\n" .
                "Status: APPROVED\n\n" .
                "IMPORTANT: Please arrive at the church at least 30 minutes before the scheduled mass time.\n\n" .
                "Please bring all original documents for final verification and coordinate with the funeral home regarding arrangements.\n\n" .
                "Our prayers are with you and your family during this difficult time.\n\n" .
                "With deepest sympathy,\nParish of Divine Mercy\nFuneral Ministry";

            error_log('[FUNERAL_EMAIL] Attempting to send email...');
            if ($mail->send()) {
                error_log('[FUNERAL_EMAIL] Email sent successfully to: ' . implode(", ", $recipientEmails));
                $response["success"] = true;
                $response["message"] = "Approval email has been sent to " . implode(", ", $recipientEmails);
            } else {
                error_log('[FUNERAL_EMAIL] Email send failed: ' . $mail->ErrorInfo);
                handleError("Email not sent", $mail->ErrorInfo);
            }
        } catch (Exception $e) {
            error_log('[FUNERAL_EMAIL] Exception: ' . $e->getMessage());
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