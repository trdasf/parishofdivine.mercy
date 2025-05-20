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

    // Check if clientID is provided
    if (!isset($_GET['clientID']) || empty($_GET['clientID'])) {
        throw new Exception("Client ID is required");
    }

    $clientID = $_GET['clientID'];
    
    // Prepare the query to fetch funeral mass appointments
    // Join with deceased_info using funeralID instead of clientID
    $sql = "SELECT 
                f.funeralID as id,
                d.first_name as firstName, 
                d.last_name as lastName, 
                'Funeral Mass' as sacramentType, 
                f.dateOfFuneralMass as date, 
                f.timeOfFuneralMass as time, 
                f.status, 
                DATE(f.created_at) as createdAt
            FROM 
                funeral_mass_application f
            LEFT JOIN 
                deceased_info d ON f.funeralID = d.funeralID
            WHERE 
                f.clientID = ?
            ORDER BY 
                f.created_at DESC";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("i", $clientID);
    
    if (!$stmt->execute()) {
        throw new Exception("Error executing query: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    $appointments = [];
    
    while ($row = $result->fetch_assoc()) {
        $appointments[] = $row;
    }
    
    $stmt->close();
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