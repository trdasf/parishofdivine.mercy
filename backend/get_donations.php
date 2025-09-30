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

    // Prepare SQL query to get donations for the specific client
    $stmt = $conn->prepare("SELECT 
        donationID,
        clientID,
        date_of_donation,
        time_of_donation,
        full_name,
        contact_number,
        email,
        home_address,
        donation_amount,
        reference_number,
        mass_intention,
        purpose,
        intention,
        date_created
    FROM donations 
    WHERE clientID = ? 
    ORDER BY date_created DESC");

    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->bind_param("i", $clientID);

    if (!$stmt->execute()) {
        throw new Exception("Database execution error: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $donations = [];

    while ($row = $result->fetch_assoc()) {
        // Format the donation amount with peso sign
        $formattedAmount = "₱" . number_format($row['donation_amount'], 2);
        
        // Format the date for display
        $dateCreated = $row['date_created'];
        $formattedDate = date('Y-m-d', strtotime($dateCreated));
        
        $donations[] = [
            'id' => $row['donationID'],
            'donationID' => $row['donationID'],
            'clientID' => $row['clientID'],
            'name' => $row['full_name'],
            'fullName' => $row['full_name'],
            'contactNumber' => $row['contact_number'],
            'email' => $row['email'],
            'homeAddress' => $row['home_address'],
            'amount' => $formattedAmount,
            'donationAmount' => $row['donation_amount'],
            'date' => $formattedDate,
            'dateOfDonation' => $row['date_of_donation'],
            'timeOfDonation' => $row['time_of_donation'],
            'purpose' => $row['purpose'],
            'intention' => $row['intention'],
            'massIntention' => $row['mass_intention'],
            'gcashRef' => $row['reference_number'],
            'referenceNumber' => $row['reference_number'],
            'dateCreated' => $row['date_created'],
            'rawDateTime' => $dateCreated
        ];
    }

    $stmt->close();
    $conn->close();

    // Return successful response
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Donations retrieved successfully",
        "data" => $donations,
        "count" => count($donations),
        "clientID" => $clientID
    ]);

} catch (Exception $e) {
    error_log("Get donations error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "data" => [],
        "count" => 0
    ]);
}
?>