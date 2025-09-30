<?php
// Disable HTML error reporting and enable JSON error responses
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set JSON header at the very beginning
header("Content-Type: application/json; charset=UTF-8");

try {
    // CORS headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    // Handle preflight request (OPTIONS)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    // Only allow GET requests
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception("Only GET requests are allowed");
    }

    // Database connection setup
    $servername = "localhost";
    $username = "u572625467_divine_mercy";  
    $password = "Parish_12345";   
    $dbname = "u572625467_parish";  

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check the database connection
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    // Get parameters from query string
    $requestID = isset($_GET['requestID']) ? intval($_GET['requestID']) : null;
    $clientID = isset($_GET['clientID']) ? intval($_GET['clientID']) : null;

    if (!$requestID) {
        throw new Exception("Request ID is required");
    }

    if (!$clientID) {
        throw new Exception("Client ID is required");
    }

    // Prepare SQL query to fetch specific baptism request details
    // Include clientID in WHERE clause for security (ensure user can only view their own requests)
    $stmt = $conn->prepare("
        SELECT 
            reqbaptismID,
            first_name,
            middle_name,
            last_name,
            father_fname,
            father_mname,
            father_lname,
            mother_fname,
            mother_mname,
            mother_lname,
            place_of_baptism,
            date_of_baptism,
            name_of_priest,
            purpose,
            date,
            created_at,
            updated_at,
            clientID
        FROM request_baptism 
        WHERE reqbaptismID = ? AND clientID = ?
        LIMIT 1
    ");

    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->bind_param("ii", $requestID, $clientID);

    if (!$stmt->execute()) {
        throw new Exception("Database execute error: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $request = $result->fetch_assoc();

    $stmt->close();
    $conn->close();

    if (!$request) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Baptism certificate request not found or you don't have permission to view it",
            "request" => null
        ]);
        exit();
    }

    // Return success response with request details
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Baptism request details retrieved successfully",
        "request" => $request
    ]);

} catch (Exception $e) {
    error_log("Get baptism request details error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "request" => null
    ]);
}
?>