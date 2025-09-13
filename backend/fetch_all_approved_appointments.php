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
    
    // Initialize appointments array
    $approvedAppointments = [];
    $errorMessages = [];
    
    // Helper function to format status properly (standardized)
    function formatStatus($status) {
        if (empty($status)) return 'Pending';
        
        $cleanStatus = trim($status);
        $lowerStatus = strtolower($cleanStatus);
        
        // Standardize status values
        if ($lowerStatus === 'pending') {
            return 'Pending';
        } elseif ($lowerStatus === 'approved') {
            return 'Approved';
        } elseif ($lowerStatus === 'rejected' || $lowerStatus === 'declined') {
            return 'Rejected';
        }
        
        // Default fallback - capitalize first letter
        return ucfirst($lowerStatus);
    }
    
    // Function to safely execute queries and collect results
    function safelyExecuteQuery($conn, $sql, $queryName) {
        global $approvedAppointments, $errorMessages;
        
        try {
            error_log("Executing $queryName query: " . $sql);
            $result = $conn->query($sql);
            
            if ($result === false) {
                $errorMessages[] = "Error in $queryName query: " . $conn->error;
                error_log("Error in $queryName query: " . $conn->error);
                return;
            }
            
            $count = 0;
            while ($row = $result->fetch_assoc()) {
                // Add unique identifier using the actual database ID
                $row['uniqueId'] = $queryName . '_' . $row['id'];
                
                // Format status to ensure consistency
                if (isset($row['status'])) {
                    $row['status'] = formatStatus($row['status']);
                }
                
                $approvedAppointments[] = $row;
                $count++;
                
                // Debug log each row
                error_log("$queryName - Row $count: ID=" . $row['id'] . ", UniqueId=" . $row['uniqueId'] . ", Name=" . ($row['firstName'] ?? '') . " " . ($row['lastName'] ?? '') . ", Date=" . ($row['date'] ?? '') . ", Status=" . ($row['status'] ?? ''));
            }
            
            error_log("$queryName query returned $count approved appointments");
        } catch (Exception $e) {
            $errorMessages[] = "Exception in $queryName query: " . $e->getMessage();
            error_log("Exception in $queryName query: " . $e->getMessage());
        }
    }
    
    // 1. Fetch baptism appointments with status Approved
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
                      LOWER(TRIM(COALESCE(b.status, ''))) = 'approved'
                   ORDER BY 
                      b.dateOfBaptism ASC, b.baptismID ASC";
    
    safelyExecuteQuery($conn, $baptismSql, "baptism");
    
    // 2. Fetch marriage appointments with status Approved
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
                       LOWER(TRIM(COALESCE(m.status, ''))) = 'approved'
                    GROUP BY 
                       m.marriageID, m.groom_first_name, m.groom_last_name, m.date, m.time, m.status
                    ORDER BY 
                       m.date ASC, m.marriageID ASC";
    
    safelyExecuteQuery($conn, $marriageSql, "marriage");
    
    // 3. Fetch funeral mass appointments with status Approved
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
                      LOWER(TRIM(COALESCE(f.status, ''))) = 'approved'
                   ORDER BY 
                      f.dateOfFuneralMass ASC, f.funeralID ASC";
    
    safelyExecuteQuery($conn, $funeralSql, "funeral");
    
    // 4. Fetch blessing appointments with status Approved
    $blessingSql = "SELECT 
                       b.blessingID as id, 
                       b.firstName as firstName, 
                       b.lastName as lastName, 
                       'Blessing' as sacramentType, 
                       bt.blessing_type as blessingType,
                       b.preferredDate as date, 
                       b.preferredTime as time, 
                       b.status,
                       DATE(b.dateCreated) as createdAt
                    FROM 
                       blessing_application b
                    LEFT JOIN 
                       blessing_type bt ON b.blessingID = bt.blessingID
                    WHERE 
                       LOWER(TRIM(COALESCE(b.status, ''))) = 'approved'
                    ORDER BY 
                       b.preferredDate ASC, b.blessingID ASC";

    safelyExecuteQuery($conn, $blessingSql, "blessing");
    
    // 5. Fetch communion appointments with status Approved
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
                        LOWER(TRIM(COALESCE(status, ''))) = 'approved'
                     ORDER BY 
                        date ASC, communionID ASC";
    
    safelyExecuteQuery($conn, $communionSql, "communion");
    
    // 6. Fetch confirmation appointments with status Approved
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
                           LOWER(TRIM(COALESCE(status, ''))) = 'approved'
                        ORDER BY 
                           date ASC, confirmationID ASC";
    
    safelyExecuteQuery($conn, $confirmationSql, "confirmation");
    
    // 7. Fetch anointing appointments with status Approved
    $anointingSql = "SELECT 
                        a.anointingID as id, 
                        a.firstName as firstName, 
                        a.lastName as lastName, 
                        'Anointing of the Sick and Viaticum' as sacramentType, 
                        a.dateOfAnointing as date, 
                        a.timeOfAnointing as time, 
                        a.status,
                        DATE(a.dateCreated) as createdAt
                     FROM 
                        anointing_application a
                     WHERE 
                        LOWER(TRIM(COALESCE(a.status, ''))) = 'approved'
                     ORDER BY 
                        a.dateOfAnointing ASC, a.anointingID ASC";
    
    // Debug: Check anointing table before executing query
    error_log("=== DEBUGGING ANOINTING TABLE ===");
    $debugAnointingSql = "SELECT anointingID, firstName, lastName, status, dateOfAnointing, timeOfAnointing FROM anointing_application";
    $debugResult = $conn->query($debugAnointingSql);
    if ($debugResult) {
        error_log("Total anointing records in database: " . $debugResult->num_rows);
        while ($debugRow = $debugResult->fetch_assoc()) {
            error_log("Anointing Record: ID=" . $debugRow['anointingID'] . 
                     ", Name=" . $debugRow['firstName'] . " " . $debugRow['lastName'] . 
                     ", Status='" . $debugRow['status'] . "'" . 
                     ", Date=" . $debugRow['dateOfAnointing'] . 
                     ", Time=" . $debugRow['timeOfAnointing']);
        }
    }
    error_log("=== END ANOINTING DEBUG ===");
    
    safelyExecuteQuery($conn, $anointingSql, "anointing");
    
    // Format dates for consistency - SAFER VERSION
    $formattedAppointments = [];
    foreach ($approvedAppointments as $appointment) {
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
            
            $formattedAppointments[] = $appointment;
        } catch (Exception $e) {
            // Log the error but continue processing other appointments
            error_log("Error formatting date for appointment: " . json_encode($appointment) . " - " . $e->getMessage());
            // Still add the appointment even if date formatting failed
            $formattedAppointments[] = $appointment;
        }
    }
    
    // Replace the original array with the safely formatted one
    $approvedAppointments = $formattedAppointments;
    
    // Sort all appointments by appointment date
    usort($approvedAppointments, function($a, $b) {
        $dateA = isset($a['date']) ? strtotime($a['date']) : 0;
        $dateB = isset($b['date']) ? strtotime($b['date']) : 0;
        if ($dateA == $dateB) {
            // If dates are the same, sort by uniqueId for consistency
            return strcmp($a['uniqueId'], $b['uniqueId']);
        }
        return $dateA - $dateB;
    });
    
    // Debug: Log appointment count by sacrament type
    $sacramentCount = [];
    foreach ($approvedAppointments as $appointment) {
        $type = $appointment['sacramentType'];
        $sacramentCount[$type] = ($sacramentCount[$type] ?? 0) + 1;
    }
    error_log("Approved appointments by sacrament type: " . json_encode($sacramentCount));
    error_log("Total approved appointments found: " . count($approvedAppointments));
    
    // Enhanced debugging for anointing specifically
    $anointingAppointments = array_filter($approvedAppointments, function($apt) {
        return $apt['sacramentType'] === 'Anointing of the Sick and Viaticum';
    });
    error_log("=== ANOINTING APPOINTMENTS FOUND ===");
    error_log("Count: " . count($anointingAppointments));
    foreach ($anointingAppointments as $apt) {
        error_log("Anointing Appointment: ID=" . $apt['id'] . 
                 ", UniqueId=" . $apt['uniqueId'] . 
                 ", Name=" . $apt['firstName'] . " " . $apt['lastName'] . 
                 ", Date=" . $apt['date'] . 
                 ", Status=" . $apt['status']);
    }
    error_log("=== END ANOINTING APPOINTMENTS ===");
    
    $conn->close();
    
    echo json_encode([
        "success" => true,
        "appointments" => $approvedAppointments,
        "total_count" => count($approvedAppointments),
        "sacrament_breakdown" => $sacramentCount,
        "errors" => $errorMessages
    ]);

} catch (Exception $e) {
    error_log("Error in fetch_all_approved_appointments.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred while fetching approved appointments: " . $e->getMessage(),
        "errors" => $errorMessages ?? []
    ]);
}
?>