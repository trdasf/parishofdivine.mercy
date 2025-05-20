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
    // Database connection
    $servername = "localhost";
    $username = "u572625467_divine_mercy";  
    $password = "Parish_12345";   
    $dbname = "u572625467_parish";  

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
    
    // Prepare the query to fetch blessing appointments - for secretary, retrieve ONLY approved ones
    $sql = "SELECT 
                b.blessingID as id, 
                b.firstName, 
                b.lastName, 
                b.preferredDate as date, 
                b.preferredTime as time, 
                b.status, 
                DATE(b.dateCreated) as createdAt,
                bt.blessing_type as blessingType
            FROM 
                blessing_application b
            LEFT JOIN 
                blessing_type bt ON b.blessingID = bt.blessingID
            WHERE
                b.status = 'Approved'
            ORDER BY 
                b.dateCreated DESC";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Error executing query: " . $conn->error);
    }
    
    $appointments = [];
    
    while ($row = $result->fetch_assoc()) {
        $appointments[] = $row;
    }
    
    $conn->close();
    
    echo json_encode([
        "success" => true,
        "appointments" => $appointments
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