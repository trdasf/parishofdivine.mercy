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
    
    // Get current month and year from query parameters or use current date
    $currentMonth = isset($_GET['month']) ? intval($_GET['month']) : intval(date('m'));
    $currentYear = isset($_GET['year']) ? intval($_GET['year']) : intval(date('Y'));
    
    // Initialize appointments array
    $monthlyAppointments = [];
    
    // 1. Fetch baptism appointments for the current month with status Approved
    $baptismSql = "SELECT 
                      b.baptismID as id, 
                      b.firstName, 
                      b.lastName, 
                      'Baptism' as sacramentType, 
                      b.dateOfBaptism as date, 
                      b.timeOfBaptism as time, 
                      b.status 
                   FROM 
                      baptism_application b
                   WHERE 
                      b.status = 'Approved' AND
                      MONTH(b.dateOfBaptism) = ? AND 
                      YEAR(b.dateOfBaptism) = ?
                   ORDER BY 
                      b.dateOfBaptism ASC";
    
    $stmt = $conn->prepare($baptismSql);
    $stmt->bind_param("ii", $currentMonth, $currentYear);
    $stmt->execute();
    $baptismResult = $stmt->get_result();
    
    if (!$baptismResult) {
        throw new Exception("Error fetching baptism appointments: " . $conn->error);
    }
    
    while ($row = $baptismResult->fetch_assoc()) {
        $monthlyAppointments[] = $row;
    }
    
    // 2. Fetch marriage appointments for the current month with status Approved
    $marriageSql = "SELECT 
                       m.marriageID as id, 
                       m.groom_first_name as firstName, 
                       m.groom_last_name as lastName, 
                       'Marriage' as sacramentType, 
                       m.date, 
                       m.time, 
                       m.status
                    FROM 
                       marriage_application m
                    WHERE 
                       m.status = 'Approved' AND
                       MONTH(m.date) = ? AND 
                       YEAR(m.date) = ?
                    ORDER BY 
                       m.date ASC";
    
    $stmt = $conn->prepare($marriageSql);
    $stmt->bind_param("ii", $currentMonth, $currentYear);
    $stmt->execute();
    $marriageResult = $stmt->get_result();
    
    if (!$marriageResult) {
        throw new Exception("Error fetching marriage appointments: " . $conn->error);
    }
    
    while ($row = $marriageResult->fetch_assoc()) {
        $monthlyAppointments[] = $row;
    }
    
    // 3. Fetch funeral mass appointments for the current month with status Approved
    $funeralSql = "SELECT 
                      f.funeralID as id,
                      d.first_name as firstName, 
                      d.last_name as lastName, 
                      'Funeral Mass' as sacramentType, 
                      f.dateOfFuneralMass as date, 
                      f.timeOfFuneralMass as time, 
                      f.status
                   FROM 
                      funeral_mass_application f
                   LEFT JOIN 
                      deceased_info d ON f.funeralID = d.funeralID
                   WHERE 
                      f.status = 'Approved' AND
                      MONTH(f.dateOfFuneralMass) = ? AND 
                      YEAR(f.dateOfFuneralMass) = ?
                   ORDER BY 
                      f.dateOfFuneralMass ASC";
    
    $stmt = $conn->prepare($funeralSql);
    $stmt->bind_param("ii", $currentMonth, $currentYear);
    $stmt->execute();
    $funeralResult = $stmt->get_result();
    
    if (!$funeralResult) {
        throw new Exception("Error fetching funeral appointments: " . $conn->error);
    }
    
    while ($row = $funeralResult->fetch_assoc()) {
        $monthlyAppointments[] = $row;
    }
    
    // 4. Fetch blessing appointments for the current month with status Approved
    $blessingSql = "SELECT 
                       b.blessingID as id, 
                       b.firstName as firstName, 
                       b.lastName as lastName, 
                       'Blessing' as sacramentType, 
                       b.preferredDate as date, 
                       b.preferredTime as time, 
                       b.status
                    FROM 
                       blessing_application b
                    WHERE 
                       b.status = 'Approved' AND
                       MONTH(b.preferredDate) = ? AND 
                       YEAR(b.preferredDate) = ?
                    ORDER BY 
                       b.preferredDate ASC";
    
    $stmt = $conn->prepare($blessingSql);
    $stmt->bind_param("ii", $currentMonth, $currentYear);
    $stmt->execute();
    $blessingResult = $stmt->get_result();
    
    if (!$blessingResult) {
        throw new Exception("Error fetching blessing appointments: " . $conn->error);
    }
    
    while ($row = $blessingResult->fetch_assoc()) {
        $monthlyAppointments[] = $row;
    }
    
    // 5. Fetch communion appointments for the current month with status Approved
    $communionSql = "SELECT 
                        communionID as id, 
                        first_name as firstName, 
                        last_name as lastName, 
                        'Communion' as sacramentType, 
                        date, 
                        time, 
                        status
                     FROM 
                        communion_application
                     WHERE 
                        status = 'Approved' AND
                        MONTH(date) = ? AND 
                        YEAR(date) = ?
                     ORDER BY 
                        date ASC";
    
    $stmt = $conn->prepare($communionSql);
    $stmt->bind_param("ii", $currentMonth, $currentYear);
    $stmt->execute();
    $communionResult = $stmt->get_result();
    
    if (!$communionResult) {
        throw new Exception("Error fetching communion appointments: " . $conn->error);
    }
    
    while ($row = $communionResult->fetch_assoc()) {
        $monthlyAppointments[] = $row;
    }
    
    // 6. Fetch confirmation appointments for the current month with status Approved
    $confirmationSql = "SELECT 
                           confirmationID as id, 
                           first_name as firstName, 
                           last_name as lastName, 
                           'Confirmation' as sacramentType, 
                           date, 
                           time, 
                           status
                        FROM 
                           confirmation_application
                        WHERE 
                           status = 'Approved' AND
                           MONTH(date) = ? AND 
                           YEAR(date) = ?
                        ORDER BY 
                           date ASC";
    
    $stmt = $conn->prepare($confirmationSql);
    $stmt->bind_param("ii", $currentMonth, $currentYear);
    $stmt->execute();
    $confirmationResult = $stmt->get_result();
    
    if (!$confirmationResult) {
        throw new Exception("Error fetching confirmation appointments: " . $conn->error);
    }
    
    while ($row = $confirmationResult->fetch_assoc()) {
        $monthlyAppointments[] = $row;
    }
    
    // 7. Fetch anointing appointments for the current month with status Approved
    $anointingSql = "SELECT 
                        anointingID as id, 
                        firstName as firstName, 
                        lastName as lastName, 
                        'Anointing of the Sick and Viaticum' as sacramentType, 
                        dateOfAnointing as date, 
                        timeOfAnointing as time, 
                        status
                     FROM 
                        anointing_application
                     WHERE 
                        status = 'Approved' AND
                        MONTH(dateOfAnointing) = ? AND 
                        YEAR(dateOfAnointing) = ?
                     ORDER BY 
                        dateOfAnointing ASC";
    
    $stmt = $conn->prepare($anointingSql);
    $stmt->bind_param("ii", $currentMonth, $currentYear);
    $stmt->execute();
    $anointingResult = $stmt->get_result();
    
    if (!$anointingResult) {
        throw new Exception("Error fetching anointing appointments: " . $conn->error);
    }
    
    while ($row = $anointingResult->fetch_assoc()) {
        $monthlyAppointments[] = $row;
    }
    
    $conn->close();
    
    echo json_encode([
        "success" => true,
        "month" => $currentMonth,
        "year" => $currentYear,
        "appointments" => $monthlyAppointments
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