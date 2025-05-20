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
        
        // Validate input data - removed clientID from required fields
        if (!isset($data['sacramentID']) || empty($data['sacramentID']) ||
            !isset($data['sacrament_type']) || empty($data['sacrament_type']) ||
            !isset($data['date']) || empty($data['date']) ||
            !isset($data['time']) || empty($data['time']) ||
            !isset($data['priest']) || empty($data['priest'])) {
            handleError("Missing required fields");
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
        
        // Extract values from the data - removed clientID
        $sacramentID = $data['sacramentID'];
        $sacrament_type = $data['sacrament_type'];
        $date = $data['date'];
        $time = $data['time'];
        $priest = $data['priest'];
        
        // First check if there is already an approved appointment for this sacrament
        $checkStmt = $conn->prepare("SELECT appointmentID FROM approved_appointments WHERE sacramentID = ? AND sacrament_type = ?");
        if (!$checkStmt) {
            handleError("Prepare statement failed for check", $conn->error);
        }
        
        $checkStmt->bind_param("is", $sacramentID, $sacrament_type);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            // There is already an approved appointment, update it
            $row = $checkResult->fetch_assoc();
            $appointmentID = $row['appointmentID'];
            
            $updateStmt = $conn->prepare("UPDATE approved_appointments SET date = ?, time = ?, priest = ? WHERE appointmentID = ?");
            if (!$updateStmt) {
                handleError("Prepare statement failed for update", $conn->error);
            }
            
            $updateStmt->bind_param("sssi", $date, $time, $priest, $appointmentID);
            
            if ($updateStmt->execute()) {
                $response["success"] = true;
                $response["message"] = "Appointment updated successfully";
            } else {
                handleError("Failed to update appointment", $conn->error);
            }
            
            $updateStmt->close();
        } else {
            // No existing appointment, insert a new one - removed clientID
            $insertStmt = $conn->prepare("INSERT INTO approved_appointments (sacramentID, sacrament_type, date, time, priest, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
            if (!$insertStmt) {
                handleError("Prepare statement failed for insert", $conn->error);
            }
            
            $insertStmt->bind_param("issss", $sacramentID, $sacrament_type, $date, $time, $priest);
            
            if ($insertStmt->execute()) {
                $response["success"] = true;
                $response["message"] = "Appointment saved successfully";
                $response["appointmentID"] = $conn->insert_id;
            } else {
                handleError("Failed to save appointment", $conn->error);
            }
            
            $insertStmt->close();
        }
        
        $checkStmt->close();
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