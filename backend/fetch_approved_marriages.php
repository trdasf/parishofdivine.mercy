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
    
    // Prepare the query to fetch marriage appointments - for secretary, retrieve ONLY approved ones
    $sql = "SELECT 
                m.marriageID as id, 
                m.groom_first_name as groomName, 
                m.groom_last_name as groomLastName,
                m.bride_first_name as brideName,
                m.bride_last_name as brideLastName,
                m.date as date, 
                m.time as time, 
                m.status, 
                DATE(m.created_at) as createdAt
            FROM 
                marriage_application m
            WHERE
                m.status = 'Approved'
            ORDER BY 
                m.created_at DESC";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Error executing query: " . $conn->error);
    }
    
    $appointments = [];
    
    while ($row = $result->fetch_assoc()) {
        // Combine first name and last name for display
        if (isset($row['groomName']) && isset($row['groomLastName'])) {
            $row['groomName'] = $row['groomName'] . ' ' . $row['groomLastName'];
            unset($row['groomLastName']);
        }
        
        if (isset($row['brideName']) && isset($row['brideLastName'])) {
            $row['brideName'] = $row['brideName'] . ' ' . $row['brideLastName'];
            unset($row['brideLastName']);
        }
        
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