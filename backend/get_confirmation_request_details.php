<?php
// Disable HTML error reporting and enable JSON error responses
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set JSON header at the very beginning
header("Content-Type: application/json; charset=UTF-8");

try {
    // CORS headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    // Handle preflight request (OPTIONS)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    // Allow both GET and POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Only GET and POST requests are allowed");
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

    // Get parameters from request
    $clientID = null;
    $reqconfirmationID = null;
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $clientID = isset($_GET['clientID']) ? intval($_GET['clientID']) : null;
        $reqconfirmationID = isset($_GET['reqconfirmationID']) ? intval($_GET['reqconfirmationID']) : null;
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $json = file_get_contents("php://input");
        $data = json_decode($json);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON: " . json_last_error_msg());
        }
        
        $clientID = isset($data->clientID) ? intval($data->clientID) : null;
        $reqconfirmationID = isset($data->reqconfirmationID) ? intval($data->reqconfirmationID) : null;
    }

    // Validate required parameters
    if (!$clientID || $clientID <= 0) {
        throw new Exception("Valid clientID is required");
    }
    
    if (!$reqconfirmationID || $reqconfirmationID <= 0) {
        throw new Exception("Valid reqconfirmationID is required");
    }

    // Prepare SQL query to get specific confirmation request
    $stmt = $conn->prepare("SELECT 
        reqconfirmationID,
        clientID,
        first_name,
        middle_name,
        last_name,
        father_fname,
        father_mname,
        father_lname,
        mother_fname,
        mother_mname,
        mother_lname,
        place_of_confirmation,
        date_of_confirmation,
        name_of_priest,
        purpose,
        date as date_requested
    FROM request_confirmation 
    WHERE clientID = ? AND reqconfirmationID = ?
    LIMIT 1");

    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->bind_param("ii", $clientID, $reqconfirmationID);

    if (!$stmt->execute()) {
        throw new Exception("Database execution error: " . $stmt->error);
    }

    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Confirmation certificate request not found");
    }

    $row = $result->fetch_assoc();

    // Process the purpose string to determine individual purposes
    $purposeString = $row['purpose'];
    $purposeMarriage = strpos($purposeString, 'Marriage Preparation') !== false;
    $purposeSchool = strpos($purposeString, 'School Requirement') !== false;
    $purposeChurch = strpos($purposeString, 'Church Requirement') !== false;
    $purposePersonal = strpos($purposeString, 'Personal Record') !== false;
    
    // Check for "Others" purpose
    $purposeOthers = false;
    $othersText = '';
    if (preg_match('/Others:\s*(.+?)(?:,|$)/', $purposeString, $matches)) {
        $purposeOthers = true;
        $othersText = trim($matches[1]);
    }

    // Format the response data
    $confirmationData = [
        'reqconfirmationID' => $row['reqconfirmationID'],
        'clientID' => $row['clientID'],
        'requestDate' => $row['date_requested'],
        'firstName' => $row['first_name'],
        'middleName' => $row['middle_name'] ?: '',
        'lastName' => $row['last_name'],
        'fatherFirstName' => $row['father_fname'],
        'fatherMiddleName' => $row['father_mname'] ?: '',
        'fatherLastName' => $row['father_lname'],
        'motherFirstName' => $row['mother_fname'],
        'motherMiddleName' => $row['mother_mname'] ?: '',
        'motherLastName' => $row['mother_lname'],
        'placeOfConfirmation' => $row['place_of_confirmation'],
        'dateOfConfirmation' => $row['date_of_confirmation'],
        'priestName' => $row['name_of_priest'] ?: '',
        'purpose' => $row['purpose'],
        'purposeMarriage' => $purposeMarriage,
        'purposeSchool' => $purposeSchool,
        'purposeChurch' => $purposeChurch,
        'purposePersonal' => $purposePersonal,
        'purposeOthers' => $purposeOthers,
        'othersText' => $othersText
    ];

    $stmt->close();
    $conn->close();

    // Return successful response
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Confirmation request details retrieved successfully",
        "data" => $confirmationData
    ]);

} catch (Exception $e) {
    error_log("Get confirmation request details error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "data" => null
    ]);
}
?>