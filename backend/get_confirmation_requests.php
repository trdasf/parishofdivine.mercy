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

    // Get clientID from request
    $clientID = null;
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $clientID = isset($_GET['clientID']) ? intval($_GET['clientID']) : null;
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $json = file_get_contents("php://input");
        $data = json_decode($json);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON: " . json_last_error_msg());
        }
        
        $clientID = isset($data->clientID) ? intval($data->clientID) : null;
    }

    // Validate clientID
    if (!$clientID || $clientID <= 0) {
        throw new Exception("Valid clientID is required");
    }

    // Prepare SQL query to get confirmation requests for the specific client
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
    WHERE clientID = ? 
    ORDER BY date DESC");

    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->bind_param("i", $clientID);

    if (!$stmt->execute()) {
        throw new Exception("Database execution error: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $confirmationRequests = [];

    while ($row = $result->fetch_assoc()) {
        // Format the full name
        $fullName = trim($row['first_name'] . ' ' . 
                    ($row['middle_name'] ? $row['middle_name'] . ' ' : '') . 
                    $row['last_name']);
        
        // Format the date for display
        $dateRequested = $row['date_requested'];
        $formattedDate = date('Y-m-d', strtotime($dateRequested));
        
        $confirmationRequests[] = [
            'id' => $row['reqconfirmationID'],
            'reqconfirmationID' => $row['reqconfirmationID'],
            'clientID' => $row['clientID'],
            'firstName' => $row['first_name'],
            'middleName' => $row['middle_name'],
            'lastName' => $row['last_name'],
            'fullName' => $fullName,
            'fatherName' => trim($row['father_fname'] . ' ' . 
                           ($row['father_mname'] ? $row['father_mname'] . ' ' : '') . 
                           $row['father_lname']),
            'motherName' => trim($row['mother_fname'] . ' ' . 
                           ($row['mother_mname'] ? $row['mother_mname'] . ' ' : '') . 
                           $row['mother_lname']),
            'placeOfConfirmation' => $row['place_of_confirmation'],
            'dateOfConfirmation' => $row['date_of_confirmation'],
            'priestName' => $row['name_of_priest'],
            'purpose' => $row['purpose'],
            'date' => $formattedDate,
            'dateRequested' => $row['date_requested'],
            'rawDateTime' => $dateRequested
        ];
    }

    $stmt->close();
    $conn->close();

    // Return successful response
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Confirmation requests retrieved successfully",
        "data" => $confirmationRequests,
        "count" => count($confirmationRequests),
        "clientID" => $clientID
    ]);

} catch (Exception $e) {
    error_log("Get confirmation requests error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "data" => [],
        "count" => 0
    ]);
}
?>