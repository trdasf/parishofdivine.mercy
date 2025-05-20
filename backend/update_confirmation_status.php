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
    
    echo json_encode($response);
    exit();
}

// Respond to preflight requests
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

// Default response
$response = [
    "success" => false,
    "message" => "Unknown error occurred"
];

try {
    // Check if it's a POST request
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Get the JSON data from the request
        $jsonData = file_get_contents("php://input");
        $data = json_decode($jsonData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            handleError("Invalid JSON format: " . json_last_error_msg());
        }
        
        // Validate input data
        if (!isset($data['confirmationID']) || empty($data['confirmationID']) || 
            !isset($data['status']) || empty($data['status'])) {
            handleError("Missing required fields (confirmationID and status)");
        }
        
        // Database connection parameters
        $servername = "localhost";
        $username = "u572625467_divine_mercy";
        $password = "Parish_12345";
        $dbname = "u572625467_parish";
        
        // Create database connection
        $conn = new mysqli($servername, $username, $password, $dbname);
        
        // Check connection
        if ($conn->connect_error) {
            handleError("Database connection failed", $conn->connect_error);
        }
        
        // Extract values from the data
        $confirmationID = $data['confirmationID'];
        $status = $data['status'];
        
        // Update the confirmation status
        $stmt = $conn->prepare("UPDATE confirmation_application SET status = ? WHERE confirmationID = ?");
        if (!$stmt) {
            handleError("Prepare statement failed", $conn->error);
        }
        
        $stmt->bind_param("si", $status, $confirmationID);
        
        if ($stmt->execute()) {
            // Check if any rows were affected
            if ($stmt->affected_rows > 0) {
                // Status updated successfully
                $response["success"] = true;
                $response["message"] = "Confirmation status updated successfully";
                
                // If status is "Approved", send email notification
                if ($status === "Approved") {
                    // Make a request to the approved_confirmation_email.php script
                    $emailData = json_encode(["confirmationID" => $confirmationID]);
                    
                    $ch = curl_init();
                    
                    $url = 'https://parishofdivinemercy.com/backend/approved_confirmation_email.php';
                    
                    // Set cURL options
                    curl_setopt($ch, CURLOPT_URL, $url);
                    curl_setopt($ch, CURLOPT_POST, 1);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, $emailData);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                        'Content-Type: application/json',
                        'Content-Length: ' . strlen($emailData)
                    ));
                    
                    // Execute the cURL request and get response
                    $emailResponse = curl_exec($ch);
                    
                    // Check for errors
                    if (curl_errno($ch)) {
                        error_log('cURL error when sending email: ' . curl_error($ch));
                        $response["email_sent"] = false;
                        $response["email_error"] = "Failed to send notification email: " . curl_error($ch);
                    } else {
                        // Decode the response
                        $emailResult = json_decode($emailResponse, true);
                        
                        if (isset($emailResult['success']) && $emailResult['success']) {
                            $response["email_sent"] = true;
                            $response["email_message"] = "Notification email sent successfully";
                        } else {
                            $response["email_sent"] = false;
                            $response["email_error"] = isset($emailResult['message']) ? $emailResult['message'] : "Failed to send notification email";
                        }
                    }
                    
                    curl_close($ch);
                }
            } else {
                // No rows were affected - confirmationID probably doesn't exist
                handleError("No confirmation record found with ID: " . $confirmationID);
            }
        } else {
            // Failed to update status
            handleError("Failed to update confirmation status", $conn->error);
        }
        
        $stmt->close();
        $conn->close();
    } else {
        // Not a POST request
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