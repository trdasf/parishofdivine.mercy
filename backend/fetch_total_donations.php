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

    // Allow only GET requests for this endpoint
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

    // Prepare SQL query to get total donation amount
    $stmt = $conn->prepare("SELECT COALESCE(SUM(donation_amount), 0) as total_donations FROM donations");

    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    if (!$stmt->execute()) {
        throw new Exception("Database execution error: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    
    $totalDonations = $row['total_donations'];
    $formattedTotal = "₱" . number_format($totalDonations, 2);

    $stmt->close();
    $conn->close();

    // Return successful response
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Total donations retrieved successfully",
        "total_donations" => $totalDonations,
        "formatted_total" => $formattedTotal
    ]);

} catch (Exception $e) {
    error_log("Get total donations error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "total_donations" => 0,
        "formatted_total" => "₱0.00"
    ]);
}
?>