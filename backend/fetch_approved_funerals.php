<?php
// Enable error reporting for debugging (consider disabling in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Respond to preflight (OPTIONS) request and exit
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

// Database connection
$servername = "localhost";
$username = "u572625467_divine_mercy";
$password = "Parish_12345";
$dbname = "u572625467_parish";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode([
        "success" => false,
        "message" => "Connection failed: " . $conn->connect_error
    ]));
}

try {
    // Query to get only approved funeral mass applications with deceased information
    $sql = "SELECT 
                f.funeralID as id,
                d.first_name as firstName,
                d.last_name as lastName,
                f.dateOfFuneralMass as date,
                f.timeOfFuneralMass as time,
                f.status,
                f.created_at as createdAt,
                f.clientID
            FROM 
                funeral_mass_application f
            JOIN 
                deceased_info d ON f.funeralID = d.funeralID
            WHERE
                f.status = 'Approved'
            ORDER BY 
                f.dateOfFuneralMass DESC";
                
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    $appointments = [];
    
    while ($row = $result->fetch_assoc()) {
        // Format the date
        if (isset($row['date'])) {
            $date = new DateTime($row['date']);
            $row['date'] = $date->format('F j, Y');
        }
        
        // Format the createdAt date
        if (isset($row['createdAt'])) {
            $createdAt = new DateTime($row['createdAt']);
            $row['createdAt'] = $createdAt->format('F j, Y');
        }
        
        $appointments[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "message" => "Approved funeral mass applications retrieved successfully",
        "appointments" => $appointments
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?> 