<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON header
header("Content-Type: application/json; charset=UTF-8");

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Check if it's a POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Invalid request method");
    }

    // Get the JSON data from the request
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // Validate input
    if (!isset($data['funeralID']) || !isset($data['status'])) {
        throw new Exception("Missing required parameters: funeralID and status");
    }

    $funeralID = $data['funeralID'];
    $status = $data['status'];

    // Database connection
    $servername = "localhost";
    $username = "u572625467_divine_mercy";  
    $password = "Parish_12345";   
    $dbname = "u572625467_parish";  

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    // Update status of funeral mass application
    $sql = "UPDATE funeral_mass_application SET status = ? WHERE funeralID = ?";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("si", $status, $funeralID);
    
    if (!$stmt->execute()) {
        throw new Exception("Error updating status: " . $stmt->error);
    }
    
    if ($stmt->affected_rows > 0) {
        $message = "Status updated successfully";
    } else {
        $message = "No changes made. Funeral mass application might not exist or already has the same status.";
    }
    
    $stmt->close();
    $conn->close();
    
    echo json_encode([
        "success" => true,
        "message" => $message
    ]);

} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?> 