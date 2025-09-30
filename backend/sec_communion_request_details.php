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

    // Get reqcommunionID from query string
    $reqcommunionID = isset($_GET['reqcommunionID']) ? intval($_GET['reqcommunionID']) : null;

    if (!$reqcommunionID) {
        throw new Exception("Communion request ID is required");
    }

    // Prepare SQL query to fetch specific communion request details
    // Secretary can view any request, so no clientID restriction
    $stmt = $conn->prepare("
        SELECT 
            reqcommunionID,
            first_name,
            middle_name,
            last_name,
            father_fname,
            father_mname,
            father_lname,
            mother_fname,
            mother_mname,
            mother_lname,
            place_of_communion,
            date_of_communion,
            name_of_priest,
            purpose,
            date as date_submitted,
            clientID
        FROM request_communion 
        WHERE reqcommunionID = ?
        LIMIT 1
    ");

    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->bind_param("i", $reqcommunionID);

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
            "message" => "Communion certificate request not found",
            "request" => null
        ]);
        exit();
    }

    // Process the purpose string to determine individual purposes
    $purposeString = $request['purpose'];
    $purposeSchool = strpos($purposeString, 'School Requirement') !== false;
    $purposeConfirmation = strpos($purposeString, 'Confirmation Preparation') !== false;
    $purposeMarriage = strpos($purposeString, 'Marriage Preparation') !== false;
    $purposePersonal = strpos($purposeString, 'Personal Record') !== false;
    
    // Check for "Others" purpose
    $purposeOthers = false;
    $othersText = '';
    if (preg_match('/Others:\s*(.+?)(?:,|$)/', $purposeString, $matches)) {
        $purposeOthers = true;
        $othersText = trim($matches[1]);
    }

    // Add processed purpose data to the response
    $request['purposeSchool'] = $purposeSchool;
    $request['purposeConfirmation'] = $purposeConfirmation;
    $request['purposeMarriage'] = $purposeMarriage;
    $request['purposePersonal'] = $purposePersonal;
    $request['purposeOthers'] = $purposeOthers;
    $request['othersText'] = $othersText;

    // Return success response with request details
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Communion request details retrieved successfully",
        "request" => $request
    ]);

} catch (Exception $e) {
    error_log("Get communion request details error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "request" => null
    ]);
}
?>