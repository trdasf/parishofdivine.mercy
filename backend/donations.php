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
    $data = json_decode($json);

    // Check if JSON parsing failed
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON: " . json_last_error_msg());
    }

    // Validate received data
    if (!$data || !isset($data->dateOfDonation, $data->timeOfDonation, $data->fullName, $data->contactNumber, 
                         $data->email, $data->homeAddress, $data->donationAmount, $data->referenceNumber, $data->purpose)) {
        throw new Exception("Incomplete data provided. Please fill in all required fields.");
    }

    // Sanitize input data
    $date_of_donation = $conn->real_escape_string(trim($data->dateOfDonation));
    $time_of_donation = $conn->real_escape_string(trim($data->timeOfDonation));
    $full_name = $conn->real_escape_string(trim($data->fullName));
    $contact_number = $conn->real_escape_string(trim($data->contactNumber));
    $email = $conn->real_escape_string(trim($data->email));
    $home_address = $conn->real_escape_string(trim($data->homeAddress));
    $donation_amount = floatval($data->donationAmount);
    $reference_number = $conn->real_escape_string(trim($data->referenceNumber));
    $mass_intention = isset($data->massIntention) && !empty(trim($data->massIntention)) ? 
                      $conn->real_escape_string(trim($data->massIntention)) : null;
    
    // Get clientID if provided (for logged-in users)
    $clientID = isset($data->clientID) ? intval($data->clientID) : null;

    // Validate required field formats
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_of_donation)) {
        throw new Exception("Invalid date format. Please use YYYY-MM-DD format.");
    }

    if (!preg_match('/^\d{2}:\d{2}$/', $time_of_donation)) {
        throw new Exception("Invalid time format. Please use HH:MM format.");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Invalid email address format.");
    }

    if ($donation_amount <= 0) {
        throw new Exception("Donation amount must be greater than zero.");
    }

    // Process purpose - handle custom purpose
    $purpose = $conn->real_escape_string(trim($data->purpose));
    if (isset($data->customPurpose) && !empty(trim($data->customPurpose))) {
        $purpose = "Others: " . $conn->real_escape_string(trim($data->customPurpose));
    }

    // Process intention - handle custom intention
    $intention = null;
    if (isset($data->intention) && !empty(trim($data->intention))) {
        $intention = $conn->real_escape_string(trim($data->intention));
        if (isset($data->customIntention) && !empty(trim($data->customIntention))) {
            $intention = "Others: " . $conn->real_escape_string(trim($data->customIntention));
        }
    }

    // Insert the donation record
    $stmt = $conn->prepare("INSERT INTO donations (clientID, date_of_donation, time_of_donation, full_name, contact_number, email, home_address, donation_amount, reference_number, mass_intention, purpose, intention) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->bind_param("issssssdssss", 
        $clientID,
        $date_of_donation, 
        $time_of_donation,
        $full_name, 
        $contact_number, 
        $email,
        $home_address, 
        $donation_amount, 
        $reference_number,
        $mass_intention, 
        $purpose, 
        $intention
    );

    if ($stmt->execute()) {
        $donation_id = $conn->insert_id;
        
        http_response_code(201); // Created status code
        echo json_encode([
            "success" => true, 
            "message" => "Donation submitted successfully.",
            "donationID" => $donation_id,
            "data" => [
                "donationID" => $donation_id,
                "full_name" => $full_name,
                "donation_amount" => $donation_amount,
                "purpose" => $purpose,
                "date_submitted" => date('Y-m-d H:i:s')
            ]
        ]);
    } else {
        throw new Exception("Database error: " . $stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    error_log("Donation submission error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "debug" => $e->getMessage() // Remove this line in production
    ]);
}
?>