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
    
    // Initialize appointments array
    $allAppointments = [];
    
    // 1. Fetch baptism appointments
    $baptismSql = "SELECT 
                      b.baptismID as id, 
                      b.firstName, 
                      b.lastName, 
                      'Baptism' as sacramentType, 
                      b.dateOfBaptism as date, 
                      b.timeOfBaptism as time, 
                      b.status, 
                      DATE(b.created_at) as createdAt
                   FROM 
                      baptism_application b
                   ORDER BY 
                      b.created_at DESC";
    
    $baptismResult = $conn->query($baptismSql);
    if (!$baptismResult) {
        throw new Exception("Error fetching baptism appointments: " . $conn->error);
    }
    
    while ($row = $baptismResult->fetch_assoc()) {
        $allAppointments[] = $row;
    }
    
    // 2. Fetch marriage appointments
    $marriageSql = "SELECT 
                       m.marriageID as id, 
                       m.groom_first_name as firstName, 
                       m.groom_last_name as lastName, 
                       'Marriage' as sacramentType, 
                       m.date, 
                       m.time, 
                       m.status, 
                       DATE(m.created_at) as createdAt
                    FROM 
                       marriage_application m
                    ORDER BY 
                       m.created_at DESC";
    
    $marriageResult = $conn->query($marriageSql);
    if (!$marriageResult) {
        throw new Exception("Error fetching marriage appointments: " . $conn->error);
    }
    
    while ($row = $marriageResult->fetch_assoc()) {
        $allAppointments[] = $row;
    }
    
    // 3. Fetch funeral mass appointments - FIXED to use deceased_info properly
    $funeralSql = "SELECT 
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
                   ORDER BY 
                      f.created_at DESC";
    
    $funeralResult = $conn->query($funeralSql);
    if (!$funeralResult) {
        throw new Exception("Error fetching funeral appointments: " . $conn->error);
    }
    
    while ($row = $funeralResult->fetch_assoc()) {
        $allAppointments[] = $row;
    }
    
    // 4. Fetch blessing appointments
    $blessingSql = "SELECT 
                       b.blessingID as id, 
                       b.firstName as firstName, 
                       b.lastName as lastName, 
                       'Blessing' as sacramentType, 
                       b.preferredDate as date, 
                       b.preferredTime as time, 
                       b.status, 
                       DATE(b.dateCreated) as createdAt
                    FROM 
                       blessing_application b
                    ORDER BY 
                       b.dateCreated DESC";
    
    $blessingResult = $conn->query($blessingSql);
    if (!$blessingResult) {
        throw new Exception("Error fetching blessing appointments: " . $conn->error);
    }
    
    while ($row = $blessingResult->fetch_assoc()) {
        $allAppointments[] = $row;
    }
    
    // 5. Fetch communion appointments
    $communionSql = "SELECT 
                        communionID as id, 
                        first_name as firstName, 
                        last_name as lastName, 
                        'Communion' as sacramentType, 
                        date, 
                        time, 
                        status, 
                        DATE(created_at) as createdAt
                     FROM 
                        communion_application
                     ORDER BY 
                        created_at DESC";
    
    $communionResult = $conn->query($communionSql);
    if (!$communionResult) {
        throw new Exception("Error fetching communion appointments: " . $conn->error);
    }
    
    while ($row = $communionResult->fetch_assoc()) {
        $allAppointments[] = $row;
    }
    
    // 6. Fetch confirmation appointments
    $confirmationSql = "SELECT 
                           confirmationID as id, 
                           first_name as firstName, 
                           last_name as lastName, 
                           'Confirmation' as sacramentType, 
                           date, 
                           time, 
                           status, 
                           DATE(created_at) as createdAt
                        FROM 
                           confirmation_application
                        ORDER BY 
                           created_at DESC";
    
    $confirmationResult = $conn->query($confirmationSql);
    if (!$confirmationResult) {
        throw new Exception("Error fetching confirmation appointments: " . $conn->error);
    }
    
    while ($row = $confirmationResult->fetch_assoc()) {
        $allAppointments[] = $row;
    }
    
    // 7. Fetch anointing appointments
    $anointingSql = "SELECT 
                        anointingID as id, 
                        firstName as firstName, 
                        lastName as lastName, 
                        'Anointing of the Sick and Viaticum' as sacramentType, 
                        dateOfAnointing as date, 
                        timeOfAnointing as time, 
                        status, 
                        DATE(dateCreated) as createdAt
                     FROM 
                        anointing_application
                     ORDER BY 
                        dateCreated DESC";
    
    $anointingResult = $conn->query($anointingSql);
    if (!$anointingResult) {
        throw new Exception("Error fetching anointing appointments: " . $conn->error);
    }
    
    while ($row = $anointingResult->fetch_assoc()) {
        $allAppointments[] = $row;
    }
    
    $conn->close();
    
    echo json_encode([
        "success" => true,
        "appointments" => $allAppointments
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