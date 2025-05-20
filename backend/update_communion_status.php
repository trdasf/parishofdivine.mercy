<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

// Set JSON header and CORS headers
header("Content-Type: application/json; charset=UTF-8");
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

    error_log("Received data: " . $json);

    // Validate input
    if (!isset($data['communionID']) || !isset($data['status'])) {
        throw new Exception("Missing required parameters: communionID and status");
    }

    $communionID = $data['communionID'];
    $status = $data['status'];

    error_log("Updating communion ID: $communionID to status: $status");

    // Database connection
    $servername = "localhost";
    $username = "u572625467_divine_mercy";  
    $password = "Parish_12345";   
    $dbname = "u572625467_parish";  

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    // Update status of communion application
    $sql = "UPDATE communion_application SET status = ? WHERE communionID = ?";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("si", $status, $communionID);
    
    if (!$stmt->execute()) {
        throw new Exception("Error updating status: " . $stmt->error);
    }
    
    if ($stmt->affected_rows > 0) {
        $message = "Status updated successfully";
        
        // If status is "Approved", send confirmation email
        if ($status === "Approved") {
            // Make a request to the approved_communion_email.php script
            $emailData = json_encode(["communionID" => $communionID]);
            
            $ch = curl_init();
            
            $url = 'https://parishofdivinemercy.com/backend/approved_communion_email.php';
            
            // Set cURL options
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $emailData);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
            
            // Execute the request
            $emailResponse = curl_exec($ch);
            
            // Check for errors
            if (curl_errno($ch)) {
                error_log("cURL Error: " . curl_error($ch));
            }
            
            curl_close($ch);
            
            // Log and include email response
            $emailResult = json_decode($emailResponse, true);
            error_log("Email API response: " . $emailResponse);
            
            $emailSent = isset($emailResult['success']) && $emailResult['success'] === true;
            $emailMessage = isset($emailResult['message']) ? $emailResult['message'] : "Unknown email status";
        }
    } else {
        $message = "No changes made. Communion application might not exist or already has the same status.";
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
    error_log("Error in update_communion_status.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>