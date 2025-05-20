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
header("Access-Control-Allow-Methods: GET, OPTIONS");
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
    "message" => "Unknown error occurred",
    "appointment" => null
];

try {
    // Check if it's a GET request
    if ($_SERVER["REQUEST_METHOD"] == "GET") {
        // Validate required parameters
        if (!isset($_GET['sacramentID']) || empty($_GET['sacramentID'])) {
            handleError("Missing sacrament ID");
        }
        
        if (!isset($_GET['sacrament_type']) || empty($_GET['sacrament_type'])) {
            handleError("Missing sacrament type");
        }
        
        $sacramentID = $_GET['sacramentID'];
        $sacramentType = $_GET['sacrament_type'];
        
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
        
        // Prepare SQL statement to get the approved appointment
        $stmt = $conn->prepare("SELECT date, time, priest FROM approved_appointments WHERE sacramentID = ? AND sacrament_type = ?");
        if (!$stmt) {
            handleError("Prepare statement failed", $conn->error);
        }
        
        $stmt->bind_param("is", $sacramentID, $sacramentType);
        
        if (!$stmt->execute()) {
            handleError("Execute statement failed", $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Found appointment data
            $appointmentData = $result->fetch_assoc();
            
            $response["success"] = true;
            $response["message"] = "Appointment details fetched successfully";
            $response["appointment"] = [
                "date" => $appointmentData["date"],
                "time" => $appointmentData["time"],
                "priest" => $appointmentData["priest"]
            ];
        } else {
            // No approved appointment found
            $response["success"] = true;
            $response["message"] = "No approved appointment found for this sacrament";
        }
        
        $stmt->close();
        $conn->close();
    } else {
        handleError("Invalid request method. Only GET requests are accepted.");
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