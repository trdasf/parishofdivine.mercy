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

    // Get clientID from query parameters
    $clientID = isset($_GET['clientID']) ? intval($_GET['clientID']) : null;

    if (!$clientID) {
        throw new Exception("ClientID is required");
    }

    // Prepare SQL query to fetch baptism requests for the specific client
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
            updated_at
        FROM request_baptism 
        WHERE clientID = ? 
        ORDER BY created_at DESC
    ");

    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->bind_param("i", $clientID);

    if (!$stmt->execute()) {
        throw new Exception("Database execute error: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $requests = [];

    while ($row = $result->fetch_assoc()) {
        $requests[] = $row;
    }

    $stmt->close();
    $conn->close();

    // Return success response with requests
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Baptism requests retrieved successfully",
        "requests" => $requests,
        "count" => count($requests)
    ]);

} catch (Exception $e) {
    error_log("Get baptism requests error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "requests" => [],
        "count" => 0
    ]);
}
?>