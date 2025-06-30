<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON header
header("Content-Type: application/json; charset=UTF-8");

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Check if it's a POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method");
    }

    // Get the JSON data from the request
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // Validate input
    if (!isset($data['funeralID']) || !isset($data['status'])) {
        throw new Exception("Missing required parameters: funeralID and status");
    }

    $funeralID = $data['funeralID'];
    $status = $data['status'];
    
    // Get optional schedule parameters from request (these are for the approved appointment, not the original request)
    $date = isset($data['date']) ? $data['date'] : null;
    $time = isset($data['time']) ? $data['time'] : null;
    $priest = isset($data['priest']) ? $data['priest'] : null;

    // Database connection
    $servername = "localhost";
    $username = "u572625467_divine_mercy";  
    $password = "Parish_12345";   
    $dbname = "u572625467_parish";  

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    // IMPORTANT FIX: Only update the status, NOT the date/time/priest fields
    // The original appointment request details should remain unchanged
    $sql = "UPDATE funeral_mass_application SET status = ? WHERE funeralID = ?";
    $params = [$status, $funeralID];
    $types = "si";
    
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param($types, ...$params);
    
    if (!$stmt->execute()) {
        throw new Exception("Error updating status: " . $stmt->error);
    }
    
    if ($stmt->affected_rows > 0) {
        $message = "Status updated successfully";
        
        // If status is "Approved", send confirmation email
        if ($status === "Approved") {
            // Make a request to the approved_funeral_email.php script
            $emailData = [
                "funeralID" => $funeralID
            ];
            
            // Add schedule information if provided (this will be used for the email and saved in approved_appointment table)
            if ($date !== null) {
                $emailData["date"] = $date;
            }
            
            if ($time !== null) {
                $emailData["time"] = $time;
            }
            
            if ($priest !== null) {
                $emailData["priest"] = $priest;
            }
            
            $jsonEmailData = json_encode($emailData);
            
            $ch = curl_init();
            
            $url = 'https://parishofdivinemercy.com/backend/approved_funeral_email.php';
            
            // Set cURL options
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonEmailData);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
            curl_setopt($ch, CURLOPT_TIMEOUT, 30); // 30-second timeout
            
            // Execute the request
            $emailResponse = curl_exec($ch);
            
            // Check for errors
            if (curl_errno($ch)) {
                error_log("cURL Error: " . curl_error($ch));
                $emailSent = false;
                $emailMessage = "Failed to send email: " . curl_error($ch);
            } else {
                // Log and include email response
                error_log("Email API response: " . $emailResponse);
                
                $emailResult = json_decode($emailResponse, true);
                
                if (json_last_error() !== JSON_ERROR_NONE) {
                    $emailSent = false;
                    $emailMessage = "Invalid response from email server";
                } else {
                    $emailSent = isset($emailResult['success']) && $emailResult['success'] === true;
                    $emailMessage = isset($emailResult['message']) ? $emailResult['message'] : "Unknown email status";
                }
            }
            
            curl_close($ch);
        }
    } else {
        $message = "No changes made. Funeral mass application might not exist or already has the same status.";
    }
    
    $stmt->close();
    $conn->close();
    
    $response = [
        "success" => true,
        "message" => $message
    ];
    
    // Add email info to response if we tried to send an email
    if (isset($emailSent)) {
        $response["email_sent"] = $emailSent;
        $response["email_message"] = $emailMessage;
    }
    
    echo json_encode($response);

} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>