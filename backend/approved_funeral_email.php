<?php
// Enable error reporting for debugging (consider disabling in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', 'email_errors.log'); // Add dedicated log file

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
    error_log("Database connection failed: " . $conn->connect_error);
    die(json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]));
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
    error_log("Received approval email request: " . $jsonData);
    
    if (isset($data['funeralID'])) {
        $funeralID = $data['funeralID'];
        
        // Extract schedule information from request (if provided)
        $scheduledDate = isset($data['date']) ? $data['date'] : null;
        $scheduledTime = isset($data['time']) ? $data['time'] : null;
        $assignedPriest = isset($data['priest']) ? $data['priest'] : null;
        
        // Get funeral details
        $stmt = $conn->prepare("
            SELECT f.*, c.first_name AS client_first_name, c.last_name AS client_last_name, c.email AS client_email 
            FROM funeral_mass_application f
            LEFT JOIN client_registration c ON f.clientID = c.clientID
            WHERE f.funeralID = ?");
        
        if (!$stmt) {
            error_log("Prepare failed for funeral query: " . $conn->error);
            die(json_encode(["success" => false, "message" => "Database query preparation failed"]));
        }
        
        $stmt->bind_param("i", $funeralID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $funeralData = $result->fetch_assoc();
            
            // Get deceased information
            $stmt = $conn->prepare("SELECT * FROM deceased_info WHERE funeralID = ?");
            if (!$stmt) {
                error_log("Prepare failed for deceased query: " . $conn->error);
                $deceasedData = null;
            } else {
                $stmt->bind_param("i", $funeralID);
                $stmt->execute();
                $deceasedResult = $stmt->get_result();
                $deceasedData = $deceasedResult->fetch_assoc();
            }
            
            // Get requester information
            $stmt = $conn->prepare("SELECT * FROM requester_info WHERE funeralID = ?");
            if (!$stmt) {
                error_log("Prepare failed for requester query: " . $conn->error);
                $requesterData = null;
            } else {
                $stmt->bind_param("i", $funeralID);
                $stmt->execute();
                $requesterResult = $stmt->get_result();
                $requesterData = $requesterResult->fetch_assoc();
            }
            
            // If we have data but no deceased/requester info, log it
            if (!isset($deceasedData) || !$deceasedData) {
                error_log("No deceased data found for funeralID: " . $funeralID);
                // Set reasonable defaults
                $deceasedData = [
                    'first_name' => 'Unknown',
                    'middle_name' => '',
                    'last_name' => 'Deceased'
                ];
            }
            
            // Create new PHPMailer instance
            $mail = new PHPMailer(true);
            
            try {
                // Server settings
                $mail->SMTPDebug = 0;                      // Set to 0 for production, 2 for debugging
                $mail->isSMTP();                           // Use SMTP
                $mail->Host       = 'smtp.gmail.com';      // Gmail SMTP server
                $mail->SMTPAuth   = true;                  // Enable SMTP authentication
                $mail->Username   = 'parishofdivinemercy@gmail.com'; // SMTP username
                $mail->Password   = 'scdq scnf milp uson'; // App Password
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Enable TLS encryption
                $mail->Port       = 587;                   // TCP port to connect to
                
                // Recipients
                $mail->setFrom('parishofdivinemercy@gmail.com', 'Parish of Divine Mercy');
                
                $recipientFound = false;
                
                // Add client's email if available
                if (isset($funeralData['client_email']) && !empty($funeralData['client_email'])) {
                    $mail->addAddress($funeralData['client_email'], $funeralData['client_first_name'] . ' ' . $funeralData['client_last_name']);
                    $recipientFound = true;
                    error_log("Adding client email recipient: " . $funeralData['client_email']);
                }
                
                // Add requester's email if available and different from client
                if (isset($requesterData['email']) && !empty($requesterData['email']) && 
                    (!isset($funeralData['client_email']) || $requesterData['email'] != $funeralData['client_email'])) {
                    $mail->addAddress($requesterData['email'], $requesterData['first_name'] . ' ' . $requesterData['last_name']);
                    $recipientFound = true;
                    error_log("Adding requester email recipient: " . $requesterData['email']);
                }
                
                // If no recipients were found, report error
                if (!$recipientFound) {
                    throw new Exception("No valid email recipients found for funeralID: " . $funeralID);
                }
                
                // Use scheduled date/time from parameters if provided, otherwise use from database
                $dateOfFuneralMass = $scheduledDate ?? $funeralData['dateOfFuneralMass'];
                $timeOfFuneralMass = $scheduledTime ?? $funeralData['timeOfFuneralMass'];
                $priestName = $assignedPriest ?? $funeralData['priestName'];
                
                // Format the date for display
                $funeralDate = new DateTime($dateOfFuneralMass);
                $formattedDate = $funeralDate->format('F j, Y');
                
                // Format the time for display
                $formattedTime = date('g:i A', strtotime($timeOfFuneralMass));
                
                // Full name of deceased
                $deceasedName = $deceasedData['first_name'] . ' ' . 
                               ($deceasedData['middle_name'] ? $deceasedData['middle_name'] . ' ' : '') . 
                               $deceasedData['last_name'];
                
                // Client or requester name
                $clientName = isset($funeralData['client_first_name']) ? 
                             ($funeralData['client_first_name'] . ' ' . $funeralData['client_last_name']) : 
                             (isset($requesterData['first_name']) ? ($requesterData['first_name'] . ' ' . $requesterData['last_name']) : 'Valued Parishioner');
                
                // Email content with matching color scheme
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
                                <h2 style='color: #573901; font-family: Montserrat, sans-serif; margin-bottom: 20px;'>Dear {$clientName},</h2>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px;'>We are writing to inform you that your funeral mass application for your beloved departed has been <strong style='color: #28a745;'>APPROVED</strong>.</p>
                                
                                <div style='background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;'>
                                    <h3 style='color: #573901; font-family: Montserrat, sans-serif; margin-top: 0; font-size: 18px;'>Funeral Mass Details:</h3>
                                    <table style='width: 100%; font-family: Roboto, sans-serif; color: #000;'>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Deceased:</td>
                                            <td style='padding: 8px 0;'>{$deceasedName}</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Date of Mass:</td>
                                            <td style='padding: 8px 0;'>{$formattedDate}</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Time:</td>
                                            <td style='padding: 8px 0;'>{$formattedTime}</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Celebrant:</td>
                                            <td style='padding: 8px 0;'>{$priestName}</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 8px 0; font-weight: 500;'>Status:</td>
                                            <td style='padding: 8px 0;'><span style='background-color: #d4edda; color: #155724; padding: 4px 12px; border-radius: 4px; font-weight: bold;'>APPROVED</span></td>
                                        </tr>
                                    </table>
                                </div>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 20px;'>Please note the following important information:</p>
                                
                                <div style='margin-top: 20px;'>
                                    <h3 style='color: #573901; font-family: Montserrat, sans-serif; font-size: 18px;'>Important Reminders:</h3>
                                    <ul style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; padding-left: 20px;'>
                                        <li style='margin-bottom: 10px;'>Please arrive at least 30 minutes before the scheduled mass</li>
                                        <li style='margin-bottom: 10px;'>Bring all original documents for verification</li>
                                        <li style='margin-bottom: 10px;'>Photos/memorial tables are allowed but not on the altar</li>
                                        <li style='margin-bottom: 10px;'>Eulogies may be given before/after the Mass or at the cemetery</li>
                                        <li style='margin-bottom: 10px;'>Proper and modest attire is required for all attendees</li>
                                    </ul>
                                </div>
                                
                                <div style='margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 8px;'>
                                    <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin: 0;'><em>\"Eternal rest grant unto them, O Lord, and let perpetual light shine upon them. May they rest in peace. Amen.\"</em></p>
                                </div>
                                
                                <p style='color: #000; font-family: Roboto, sans-serif; font-size: 16px; margin-top: 40px;'>With deepest sympathy,<br><strong style='color: #573901;'>Parish of Divine Mercy</strong><br>Funeral Ministry</p>
                            </div>
                            
                            <div style='background: linear-gradient(to right, #710808, #ffcccc); height: 2px; width: 100%;'></div>
                            
                            <div style='background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px;'>
                                <p style='color: #555; margin: 5px 0; font-family: Roboto, sans-serif;'>This is an automated message. Please do not reply to this email.</p>
                                <p style='color: #555; margin: 5px 0; font-family: Roboto, sans-serif;'>Parish of Divine Mercy | Alawihao, Daet, Camarines Norte</p>
                            </div>
                        </div>
                    </body>
                    </html>
                ";
                
                // Plain text version for non-HTML mail clients
                $mail->AltBody = "Dear {$clientName},\n\n" .
                    "We are writing to inform you that your funeral mass application for your beloved departed has been APPROVED.\n\n" .
                    "Funeral Mass Details:\n" .
                    "Deceased: {$deceasedName}\n" .
                    "Date of Mass: {$formattedDate}\n" .
                    "Time: {$formattedTime}\n" .
                    "Celebrant: {$priestName}\n" .
                    "Status: APPROVED\n\n" .
                    "Please arrive at least 30 minutes before the scheduled mass and bring all original documents for verification.\n\n" .
                    "With deepest sympathy,\nParish of Divine Mercy";
                
                // Send the email
                if ($mail->send()) {
                    $response["success"] = true;
                    $response["message"] = "Approval email has been sent successfully";
                    
                    // Log the successful email
                    $recipientEmails = [];
                    if (isset($funeralData['client_email'])) {
                        $recipientEmails[] = $funeralData['client_email'];
                    }
                    if (isset($requesterData['email']) && !in_array($requesterData['email'], $recipientEmails)) {
                        $recipientEmails[] = $requesterData['email'];
                    }
                    
                    error_log("Approval email successfully sent to: " . implode(", ", $recipientEmails));
                    
                    // Update the database with the scheduled information if provided
                    if ($scheduledDate || $scheduledTime || $assignedPriest) {
                        $updateQuery = "UPDATE funeral_mass_application SET ";
                        $updateParams = [];
                        $updateTypes = "";
                        
                        if ($scheduledDate) {
                            $updateQuery .= "dateOfFuneralMass = ?, ";
                            $updateParams[] = $scheduledDate;
                            $updateTypes .= "s";
                        }
                        
                        if ($scheduledTime) {
                            $updateQuery .= "timeOfFuneralMass = ?, ";
                            $updateParams[] = $scheduledTime;
                            $updateTypes .= "s";
                        }
                        
                        if ($assignedPriest) {
                            $updateQuery .= "priestName = ?, ";
                            $updateParams[] = $assignedPriest;
                            $updateTypes .= "s";
                        }
                        
                        // Remove the trailing comma and space
                        $updateQuery = rtrim($updateQuery, ", ");
                        
                        $updateQuery .= " WHERE funeralID = ?";
                        $updateParams[] = $funeralID;
                        $updateTypes .= "i";
                        
                        $updateStmt = $conn->prepare($updateQuery);
                        if ($updateStmt) {
                            $updateStmt->bind_param($updateTypes, ...$updateParams);
                            $updateStmt->execute();
                            
                            if ($updateStmt->affected_rows > 0) {
                                error_log("Updated funeral record with scheduled information");
                            }
                        }
                    }
                } else {
                    throw new Exception("Email not sent: " . $mail->ErrorInfo);
                }
            } catch (Exception $e) {
                logError("Mailer Error: " . $e->getMessage());
                $response["success"] = false;
                $response["message"] = "Failed to send approval email. Error: " . $e->getMessage();
            }
        } else {
            $response["success"] = false;
            $response["message"] = "Funeral record not found for ID: " . $funeralID;
            error_log("Funeral record not found for ID: " . $funeralID);
        }
    } else {
        logError("Missing funeral ID in request");
        $response["message"] = "Error: Funeral ID is required";
    }
} else {
    logError("Invalid request method: " . $_SERVER["REQUEST_METHOD"]);
    $response["message"] = "Invalid request method. Only POST requests are accepted.";
}

$conn->close();

// Return JSON response
echo json_encode($response);
?>