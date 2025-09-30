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

    // Get reqmarriageID from query string
    $reqmarriageID = isset($_GET['reqmarriageID']) ? intval($_GET['reqmarriageID']) : null;

    if (!$reqmarriageID) {
        throw new Exception("Marriage request ID is required");
    }

    // Prepare SQL query to fetch specific marriage request details
    // Secretary can view any request, so no clientID restriction
    $stmt = $conn->prepare("
        SELECT 
            reqmarriageID,
            groom_fname,
            groom_mname,
            groom_lname,
            bride_fname,
            bride_mname,
            bride_lname,
            place_of_marriage,
            date_of_marriage,
            name_of_priest,
            purpose,
            date as date_submitted,
            clientID
        FROM request_marriage 
        WHERE reqmarriageID = ?
        LIMIT 1
    ");

    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->bind_param("i", $reqmarriageID);

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
            "message" => "Marriage certificate request not found",
            "request" => null
        ]);
        exit();
    }

    // Process the purpose string to determine individual purposes
    $purposeString = $request['purpose'];
    $purposeCivil = strpos($purposeString, 'Civil Requirement') !== false;
    $purposeChurch = strpos($purposeString, 'Church Requirement') !== false;
    $purposePersonal = strpos($purposeString, 'Personal Record') !== false;
    
    // Check for "Others" purpose
    $purposeOthers = false;
    $othersText = '';
    if (preg_match('/Others:\s*(.+?)(?:,|$)/', $purposeString, $matches)) {
        $purposeOthers = true;
        $othersText = trim($matches[1]);
    }

    // Add processed purpose data to the response
    $request['purposeCivil'] = $purposeCivil;
    $request['purposeChurch'] = $purposeChurch;
    $request['purposePersonal'] = $purposePersonal;
    $request['purposeOthers'] = $purposeOthers;
    $request['othersText'] = $othersText;

    // Return success response with request details
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Marriage request details retrieved successfully",
        "request" => $request
    ]);

} catch (Exception $e) {
    error_log("Get marriage request details error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "request" => null
    ]);
}
?>