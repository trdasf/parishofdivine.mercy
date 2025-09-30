<?php
// Disable HTML error reporting and enable JSON error responses
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set JSON header at the very beginning
header("Content-Type: application/json; charset=UTF-8");

try {
    // CORS headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    // Handle preflight request (OPTIONS)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    // Only allow POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Only POST requests are allowed");
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

    // Read and decode JSON data from the request
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    // Check if JSON parsing failed
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON: " . json_last_error_msg());
    }

    // Validate required fields
    $requiredFields = [
        'dateOfDonation',
        'timeOfDonation', 
        'fullName',
        'contactNumber',
        'email',
        'homeAddress',
        'donationAmount',
        'referenceNumber',
        'purpose'
    ];

    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            throw new Exception("Missing required field: $field");
        }
    }

    // Extract and validate data
    $clientID = isset($data['clientID']) ? $data['clientID'] : null; // Can be null for secretary
    $dateOfDonation = trim($data['dateOfDonation']);
    $timeOfDonation = trim($data['timeOfDonation']);
    $fullName = trim($data['fullName']);
    $contactNumber = trim($data['contactNumber']);
    $email = trim($data['email']);
    $homeAddress = trim($data['homeAddress']);
    $donationAmount = floatval($data['donationAmount']);
    $referenceNumber = trim($data['referenceNumber']);
    // Note: gcashNumber is NOT being inserted into database
    $massIntention = isset($data['massIntention']) && !empty(trim($data['massIntention'])) ? 
                      trim($data['massIntention']) : null;
    $purpose = trim($data['purpose']);
    $intentionType = isset($data['intentionType']) && !empty(trim($data['intentionType'])) ? 
                     trim($data['intentionType']) : null;

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email format");
    }

    // Validate donation amount
    if ($donationAmount <= 0) {
        throw new Exception("Donation amount must be greater than 0");
    }

    // Validate date format
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateOfDonation)) {
        throw new Exception("Invalid date format. Use YYYY-MM-DD");
    }

    // Validate time format
    if (!preg_match('/^\d{2}:\d{2}$/', $timeOfDonation)) {
        throw new Exception("Invalid time format. Use HH:MM");
    }

    // Check if reference number already exists
    $checkStmt = $conn->prepare("SELECT donationID FROM donations WHERE reference_number = ?");
    if (!$checkStmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $checkStmt->bind_param("s", $referenceNumber);
    if (!$checkStmt->execute()) {
        throw new Exception("Database execution error: " . $checkStmt->error);
    }

    $checkResult = $checkStmt->get_result();
    if ($checkResult->num_rows > 0) {
        $checkStmt->close();
        $conn->close();
        throw new Exception("Reference number already exists: " . $referenceNumber);
    }
    $checkStmt->close();

    // Insert new donation (gcash_number is excluded, status defaults to 'Pending')
    $stmt = $conn->prepare("INSERT INTO donations (
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
        status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')");

    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    // Bind parameters (clientID can be null)
    $stmt->bind_param("issssssdssss", 
        $clientID,
        $dateOfDonation,
        $timeOfDonation,
        $fullName,
        $contactNumber,
        $email,
        $homeAddress,
        $donationAmount,
        $referenceNumber,
        $massIntention,
        $purpose,
        $intentionType
    );

    if (!$stmt->execute()) {
        throw new Exception("Database execution error: " . $stmt->error);
    }

    $donationID = $conn->insert_id;
    $stmt->close();

    // Get the inserted donation details
    $detailsStmt = $conn->prepare("SELECT 
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
        status,
        date_created
    FROM donations WHERE donationID = ?");
    
    if (!$detailsStmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $detailsStmt->bind_param("i", $donationID);
    if (!$detailsStmt->execute()) {
        throw new Exception("Database execution error: " . $detailsStmt->error);
    }

    $detailsResult = $detailsStmt->get_result();
    $newDonation = $detailsResult->fetch_assoc();
    $detailsStmt->close();
    $conn->close();

    // Format the response data
    $formattedAmount = "₱" . number_format($newDonation['donation_amount'], 2);

    // Log the successful addition
    error_log("New donation added by secretary - ID: $donationID, Name: $fullName, Amount: $formattedAmount");

    // Return successful response
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Donation added successfully",
        "data" => [
            "donationID" => $newDonation['donationID'],
            "clientID" => $newDonation['clientID'],
            "fullName" => $newDonation['full_name'],
            "email" => $newDonation['email'],
            "amount" => $formattedAmount,
            "referenceNumber" => $newDonation['reference_number'],
            "purpose" => $newDonation['purpose'],
            "status" => $newDonation['status'],
            "dateCreated" => $newDonation['date_created']
        ]
    ]);

} catch (Exception $e) {
    error_log("Add donation error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "data" => null
    ]);
}
?>