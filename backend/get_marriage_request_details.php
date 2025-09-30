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

    // Get reqmarriageID from query parameters
    $reqmarriageID = isset($_GET['reqmarriageID']) ? intval($_GET['reqmarriageID']) : null;
    $clientID = isset($_GET['clientID']) ? intval($_GET['clientID']) : null;

    if (!$reqmarriageID) {
        throw new Exception("Marriage request ID is required");
    }

    // Prepare SQL query - include clientID check for security
    if ($clientID) {
        $stmt = $conn->prepare("SELECT reqmarriageID, clientID, groom_fname, groom_mname, groom_lname, bride_fname, bride_mname, bride_lname, place_of_marriage, date_of_marriage, name_of_priest, purpose, date FROM request_marriage WHERE reqmarriageID = ? AND clientID = ?");
        $stmt->bind_param("ii", $reqmarriageID, $clientID);
    } else {
        $stmt = $conn->prepare("SELECT reqmarriageID, clientID, groom_fname, groom_mname, groom_lname, bride_fname, bride_mname, bride_lname, place_of_marriage, date_of_marriage, name_of_priest, purpose, date FROM request_marriage WHERE reqmarriageID = ?");
        $stmt->bind_param("i", $reqmarriageID);
    }

    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Marriage certificate request not found");
    }

    $row = $result->fetch_assoc();

    // Parse the purpose string back to individual purposes
    $purposeString = $row['purpose'];
    $purposeCivil = strpos($purposeString, 'Civil Requirement') !== false;
    $purposeChurch = strpos($purposeString, 'Church Requirement') !== false;
    $purposePersonal = strpos($purposeString, 'Personal Record') !== false;
    
    // Extract "Others" text if present
    $purposeOthers = false;
    $othersText = '';
    if (preg_match('/Others:\s*(.+?)(?:,|$)/', $purposeString, $matches)) {
        $purposeOthers = true;
        $othersText = trim($matches[1]);
    }

    // Format the response data
    $requestData = [
        'reqmarriageID' => intval($row['reqmarriageID']),
        'clientID' => intval($row['clientID']),
        'requestDate' => $row['date'],
        'groomFirstName' => $row['groom_fname'],
        'groomMiddleName' => $row['groom_mname'] ?: '',
        'groomLastName' => $row['groom_lname'],
        'brideFirstName' => $row['bride_fname'],
        'brideMiddleName' => $row['bride_mname'] ?: '',
        'brideLastName' => $row['bride_lname'],
        'placeOfMarriage' => $row['place_of_marriage'],
        'dateOfMarriage' => $row['date_of_marriage'],
        'officiatingPriest' => $row['name_of_priest'] ?: '',
        'purposeCivil' => $purposeCivil,
        'purposeChurch' => $purposeChurch,
        'purposePersonal' => $purposePersonal,
        'purposeOthers' => $purposeOthers,
        'othersText' => $othersText,
        'purposeString' => $purposeString
    ];

    $stmt->close();
    $conn->close();

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Marriage certificate request details retrieved successfully",
        "data" => $requestData
    ]);

} catch (Exception $e) {
    error_log("Get marriage request details error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "data" => null
    ]);
}
?>