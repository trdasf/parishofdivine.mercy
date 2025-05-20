<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON header
header("Content-Type: application/json; charset=UTF-8");

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Check if it's a GET request
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception("Invalid request method");
    }

    // Database connection
    $servername = "localhost";
    $username = "u572625467_divine_mercy";  
    $password = "Parish_12345";   
    $dbname = "u572625467_parish";  

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    // Prepare a query to fetch approved communion applications with client information
    $sql = "
        SELECT 
            c.communionID,
            c.first_name,
            c.middle_name,
            c.last_name,
            c.date,
            c.time,
            c.priest,
            c.status,
            c.created_at,
            cr.first_name AS client_first_name,
            cr.last_name AS client_last_name,
            cr.email AS client_email
        FROM 
            communion_application c
        JOIN 
            client_registration cr ON c.clientID = cr.clientID
        WHERE 
            c.status = 'Approved'
        ORDER BY 
            c.date ASC
    ";

    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }

    $communionApplications = array();

    while ($row = $result->fetch_assoc()) {
        $communionApplications[] = $row;
    }

    // Close database connection
    $conn->close();

    // Return the data as JSON
    echo json_encode([
        "success" => true,
        "count" => count($communionApplications),
        "data" => $communionApplications
    ]);

} catch (Exception $e) {
    // Detailed error logging
    error_log("Error in fetch_approved_communions.php: " . $e->getMessage());
    error_log("SQL Query: " . $sql);
    
    // For database errors, log additional information
    if (isset($conn) && $conn->connect_errno) {
        error_log("MySQL Error: (" . $conn->connect_errno . ") " . $conn->connect_error);
    }
    
    // Close connection if it exists
    if (isset($conn)) {
        $conn->close();
    }
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "details" => "Please check server logs for more information."
    ]);
}
?> 