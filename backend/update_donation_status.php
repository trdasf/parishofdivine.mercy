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

    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // Validate required fields
    if (!$data || !isset($data['donationID']) || !isset($data['status'])) {
        throw new Exception("Missing required fields: donationID and status");
    }

    $donationID = $data['donationID'];
    $status = $data['status'];

    // Validate status value
    $allowedStatuses = ['Pending', 'Confirmed'];
    if (!in_array($status, $allowedStatuses)) {
        throw new Exception("Invalid status. Allowed values: " . implode(', ', $allowedStatuses));
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

    // First, check if the donation exists
    $checkStmt = $conn->prepare("SELECT donationID, status FROM donations WHERE donationID = ?");
    if (!$checkStmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $checkStmt->bind_param("i", $donationID);
    if (!$checkStmt->execute()) {
        throw new Exception("Database execution error: " . $checkStmt->error);
    }

    $checkResult = $checkStmt->get_result();
    if ($checkResult->num_rows === 0) {
        $checkStmt->close();
        $conn->close();
        throw new Exception("Donation not found with ID: " . $donationID);
    }

    $existingDonation = $checkResult->fetch_assoc();
    $checkStmt->close();

    // Update the donation status
    $updateStmt = $conn->prepare("UPDATE donations SET status = ?, date_updated = NOW() WHERE donationID = ?");
    if (!$updateStmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $updateStmt->bind_param("si", $status, $donationID);
    if (!$updateStmt->execute()) {
        throw new Exception("Database execution error: " . $updateStmt->error);
    }

    if ($updateStmt->affected_rows === 0) {
        $updateStmt->close();
        $conn->close();
        throw new Exception("No rows updated. Donation may not exist or status is already the same.");
    }

    $updateStmt->close();

    // Get the updated donation details
    $detailsStmt = $conn->prepare("SELECT 
        donationID,
        full_name,
        email,
        status,
        date_updated
    FROM donations WHERE donationID = ?");
    
    if (!$detailsStmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $detailsStmt->bind_param("i", $donationID);
    if (!$detailsStmt->execute()) {
        throw new Exception("Database execution error: " . $detailsStmt->error);
    }

    $detailsResult = $detailsStmt->get_result();
    $updatedDonation = $detailsResult->fetch_assoc();
    $detailsStmt->close();
    $conn->close();

    // Log the status change
    error_log("Donation status updated - ID: $donationID, Old Status: " . $existingDonation['status'] . ", New Status: $status");

    // Return successful response
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Donation status updated successfully from '" . $existingDonation['status'] . "' to '$status'",
        "data" => [
            "donationID" => $updatedDonation['donationID'],
            "fullName" => $updatedDonation['full_name'],
            "email" => $updatedDonation['email'],
            "previousStatus" => $existingDonation['status'],
            "newStatus" => $updatedDonation['status'],
            "dateUpdated" => $updatedDonation['date_updated']
        ]
    ]);

} catch (Exception $e) {
    error_log("Update donation status error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "data" => null
    ]);
}
?>