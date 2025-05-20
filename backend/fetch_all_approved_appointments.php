<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', 'parish_error.log');

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

// Initialize appointments array
$approvedAppointments = [];
$errorMessages = [];

try {
    // Database connection
    $servername = "localhost";
    $username = "u572625467_divine_mercy";  
    $password = "Parish_12345";   
    $dbname = "u572625467_parish";  

    // Enable mysqli error reporting
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    // Set charset to ensure proper encoding
    if (!$conn->set_charset("utf8")) {
        throw new Exception("Error setting charset: " . $conn->error);
    }
    
    // Function to safely execute queries and collect results
    function safelyExecuteQuery($conn, $sql, $queryName) {
        global $approvedAppointments, $errorMessages;
        
        try {
            $result = $conn->query($sql);
            
            if ($result === false) {
                $errorMessages[] = "Error in $queryName query: " . $conn->error;
                return;
            }
            
            while ($row = $result->fetch_assoc()) {
                $approvedAppointments[] = $row;
            }
        } catch (Exception $e) {
            $errorMessages[] = "Exception in $queryName query: " . $e->getMessage();
        }
    }
    
    // 1. Fetch all baptism appointments with status Approved
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
                   WHERE 
                      b.status = 'Approved'
                   ORDER BY 
                      b.dateOfBaptism ASC";
    
    safelyExecuteQuery($conn, $baptismSql, "baptism");
    
    // 2. Fetch all marriage appointments with status Approved
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
                    WHERE 
                       m.status = 'Approved'
                    ORDER BY 
                       m.date ASC";
    
    safelyExecuteQuery($conn, $marriageSql, "marriage");
    
    // 3. Fetch all funeral mass appointments with status Approved
    $funeralSql = "SELECT 
                      f.funeralID as id,
                      COALESCE(d.first_name, 'Unknown') as firstName, 
                      COALESCE(d.last_name, 'Unknown') as lastName, 
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
                      f.status = 'Approved'
                   ORDER BY 
                      f.dateOfFuneralMass ASC";
    
    safelyExecuteQuery($conn, $funeralSql, "funeral");
    
    // 4. Fetch all blessing appointments with status Approved
    $blessingSql = "SELECT 
                       b.blessingID as id, 
                       b.firstName as firstName, 
                       b.lastName as lastName, 
                       'Blessing' as sacramentType, 
                       b.blessingType,
                       b.preferredDate as date, 
                       b.preferredTime as time, 
                       b.status,
                       DATE(b.dateCreated) as createdAt
                    FROM 
                       blessing_application b
                    WHERE 
                       b.status = 'Approved'
                    ORDER BY 
                       b.preferredDate ASC";
    
    safelyExecuteQuery($conn, $blessingSql, "blessing");
    
    // 5. Fetch all communion appointments with status Approved
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
                     WHERE 
                        status = 'Approved'
                     ORDER BY 
                        date ASC";
    
    safelyExecuteQuery($conn, $communionSql, "communion");
    
    // 6. Fetch all confirmation appointments with status Approved
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
                        WHERE 
                           status = 'Approved'
                        ORDER BY 
                           date ASC";
    
    safelyExecuteQuery($conn, $confirmationSql, "confirmation");
    
    // 7. Fetch all anointing appointments with status Approved
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
                     WHERE 
                        status = 'Approved'
                     ORDER BY 
                        dateOfAnointing ASC";
    
    safelyExecuteQuery($conn, $anointingSql, "anointing");
    
    // Format dates for consistency
    foreach ($approvedAppointments as &$appointment) {
        try {
            // Format date if present and valid
            if (isset($appointment['date']) && !empty($appointment['date'])) {
                // Check if date is valid before creating DateTime object
                $timestamp = strtotime($appointment['date']);
                if ($timestamp !== false) {
                    $date = new DateTime($appointment['date']);
                    $appointment['date'] = $date->format('m/d/Y');
                }
            }
            
            // Format createdAt if present and valid
            if (isset($appointment['createdAt']) && !empty($appointment['createdAt'])) {
                // Check if date is valid before creating DateTime object
                $timestamp = strtotime($appointment['createdAt']);
                if ($timestamp !== false) {
                    $createdAt = new DateTime($appointment['createdAt']);
                    $appointment['createdAt'] = $createdAt->format('m/d/Y');
                }
            }
        } catch (Exception $e) {
            // Log the error but continue processing other appointments
            error_log("Error formatting date for appointment: " . json_encode($appointment) . " - " . $e->getMessage());
        }
    }
    
    $conn->close();
    
    echo json_encode([
        "success" => true,
        "appointments" => $approvedAppointments,
        "errors" => $errorMessages
    ]);

} catch (Exception $e) {
    error_log("Error in fetch_all_approved_appointments.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred while fetching approved appointments: " . $e->getMessage(),
        "errors" => $errorMessages
    ]);
}
?>