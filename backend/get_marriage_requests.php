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

    // Get clientID from query parameters (optional filter)
    $clientID = isset($_GET['clientID']) ? intval($_GET['clientID']) : null;

    // Prepare SQL query
    if ($clientID) {
        // Get requests for specific client
        $stmt = $conn->prepare("SELECT reqmarriageID, clientID, groom_fname, groom_mname, groom_lname, bride_fname, bride_mname, bride_lname, place_of_marriage, date_of_marriage, name_of_priest, purpose, date FROM request_marriage WHERE clientID = ? ORDER BY date DESC");
        $stmt->bind_param("i", $clientID);
    } else {
        // Get all requests (for admin view)
        $stmt = $conn->prepare("SELECT reqmarriageID, clientID, groom_fname, groom_mname, groom_lname, bride_fname, bride_mname, bride_lname, place_of_marriage, date_of_marriage, name_of_priest, purpose, date FROM request_marriage ORDER BY date DESC");
    }

    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $requests = [];
    while ($row = $result->fetch_assoc()) {
        // Format the full names
        $groomFullName = trim($row['groom_fname'] . ' ' . $row['groom_mname'] . ' ' . $row['groom_lname']);
        $brideFullName = trim($row['bride_fname'] . ' ' . $row['bride_mname'] . ' ' . $row['bride_lname']);
        
        // Format date and time
        $datetime = new DateTime($row['date']);
        $formattedDate = $datetime->format('Y-m-d');
        $formattedTime = $datetime->format('h:i A');

        $requests[] = [
            'reqmarriageID' => intval($row['reqmarriageID']),
            'clientID' => intval($row['clientID']),
            'id' => intval($row['reqmarriageID']), // For compatibility with existing frontend
            'groomFullName' => $groomFullName,
            'brideFullName' => $brideFullName,
            'firstName' => $row['groom_fname'], // For compatibility with existing search
            'lastName' => $row['groom_lname'], // For compatibility with existing search
            'placeOfMarriage' => $row['place_of_marriage'],
            'dateOfMarriage' => $row['date_of_marriage'],
            'nameOfPriest' => $row['name_of_priest'],
            'purpose' => $row['purpose'],
            'date' => $formattedDate,
            'time' => $formattedTime,
            'rawDate' => $row['date']
        ];
    }

    $stmt->close();
    $conn->close();

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Marriage certificate requests retrieved successfully",
        "data" => $requests,
        "total" => count($requests)
    ]);

} catch (Exception $e) {
    error_log("Get marriage requests error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "data" => []
    ]);
}
?>