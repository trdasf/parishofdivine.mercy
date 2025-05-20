<?php
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
    
    // Arrays to store counts
    $totalCounts = [];
    
    // Count baptism appointments
    $baptismSql = "SELECT COUNT(*) as count FROM baptism_application";
    $baptismResult = $conn->query($baptismSql);
    if (!$baptismResult) {
        throw new Exception("Error counting baptism appointments: " . $conn->error);
    }
    $baptismCount = $baptismResult->fetch_assoc()['count'];
    $totalCounts['baptism'] = $baptismCount;
    
    // Count marriage appointments
    $marriageSql = "SELECT COUNT(*) as count FROM marriage_application";
    $marriageResult = $conn->query($marriageSql);
    if (!$marriageResult) {
        throw new Exception("Error counting marriage appointments: " . $conn->error);
    }
    $marriageCount = $marriageResult->fetch_assoc()['count'];
    $totalCounts['marriage'] = $marriageCount;
    
    // Count funeral mass appointments
    $funeralSql = "SELECT COUNT(*) as count FROM funeral_mass_application";
    $funeralResult = $conn->query($funeralSql);
    if (!$funeralResult) {
        throw new Exception("Error counting funeral appointments: " . $conn->error);
    }
    $funeralCount = $funeralResult->fetch_assoc()['count'];
    $totalCounts['funeral'] = $funeralCount;
    
    // Count blessing appointments
    $blessingSql = "SELECT COUNT(*) as count FROM blessing_application";
    $blessingResult = $conn->query($blessingSql);
    if (!$blessingResult) {
        throw new Exception("Error counting blessing appointments: " . $conn->error);
    }
    $blessingCount = $blessingResult->fetch_assoc()['count'];
    $totalCounts['blessing'] = $blessingCount;
    
    // Count communion appointments
    $communionSql = "SELECT COUNT(*) as count FROM communion_application";
    $communionResult = $conn->query($communionSql);
    if (!$communionResult) {
        throw new Exception("Error counting communion appointments: " . $conn->error);
    }
    $communionCount = $communionResult->fetch_assoc()['count'];
    $totalCounts['communion'] = $communionCount;
    
    // Count confirmation appointments
    $confirmationSql = "SELECT COUNT(*) as count FROM confirmation_application";
    $confirmationResult = $conn->query($confirmationSql);
    if (!$confirmationResult) {
        throw new Exception("Error counting confirmation appointments: " . $conn->error);
    }
    $confirmationCount = $confirmationResult->fetch_assoc()['count'];
    $totalCounts['confirmation'] = $confirmationCount;
    
    // Count anointing appointments
    $anointingSql = "SELECT COUNT(*) as count FROM anointing_application";
    $anointingResult = $conn->query($anointingSql);
    if (!$anointingResult) {
        throw new Exception("Error counting anointing appointments: " . $conn->error);
    }
    $anointingCount = $anointingResult->fetch_assoc()['count'];
    $totalCounts['anointing'] = $anointingCount;
    
    // Calculate the total
    $totalAppointments = array_sum($totalCounts);
    
    $conn->close();
    
    echo json_encode([
        "success" => true,
        "total_appointments" => $totalAppointments,
        "details" => $totalCounts
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