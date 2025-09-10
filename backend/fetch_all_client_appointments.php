<?php
// Disable HTML error reporting and enable JSON error responses
ini_set('display_errors', 0);
error_reporting(E_ALL);

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
    
    // Get clientID parameter from GET request
    $clientID = isset($_GET['clientID']) ? intval($_GET['clientID']) : null;
    
    if (!$clientID) {
        throw new Exception("ClientID parameter is required");
    }
    
    // Initialize appointments array
    $allAppointments = [];
    
    // 1. Fetch baptism appointments
    try {
        $baptismSql = "SELECT 
                          b.baptismID as id, 
                          b.firstName, 
                          b.lastName, 
                          b.clientID,
                          'Baptism' as sacramentType, 
                          b.dateOfBaptism as date, 
                          b.timeOfBaptism as time, 
                          b.status, 
                          DATE(b.created_at) as createdAt,
                          'application' as appointmentSource
                       FROM 
                          baptism_application b
                       WHERE 
                          b.clientID = ?
                       ORDER BY 
                          b.created_at DESC";
        
        $stmt = $conn->prepare($baptismSql);
        if (!$stmt) {
            throw new Exception("Prepare failed for baptism: " . $conn->error);
        }
        $stmt->bind_param("i", $clientID);
        $stmt->execute();
        $baptismResult = $stmt->get_result();
        
        while ($row = $baptismResult->fetch_assoc()) {
            $allAppointments[] = $row;
        }
        $stmt->close();
    } catch (Exception $e) {
        error_log("Baptism query error: " . $e->getMessage());
        // Continue with other sacraments
    }
    
    // 2. Fetch marriage appointments
    try {
        $marriageSql = "SELECT 
                           m.marriageID as id, 
                           m.groom_first_name as firstName, 
                           m.groom_last_name as lastName, 
                           m.clientID,
                           'Marriage' as sacramentType, 
                           m.date, 
                           m.time, 
                           m.status, 
                           DATE(m.created_at) as createdAt,
                           'application' as appointmentSource
                        FROM 
                           marriage_application m
                        WHERE 
                           m.clientID = ?
                        ORDER BY 
                           m.created_at DESC";
        
        $stmt = $conn->prepare($marriageSql);
        if (!$stmt) {
            throw new Exception("Prepare failed for marriage: " . $conn->error);
        }
        $stmt->bind_param("i", $clientID);
        $stmt->execute();
        $marriageResult = $stmt->get_result();
        
        while ($row = $marriageResult->fetch_assoc()) {
            $allAppointments[] = $row;
        }
        $stmt->close();
    } catch (Exception $e) {
        error_log("Marriage query error: " . $e->getMessage());
        // Continue with other sacraments
    }
    
    // 3. Fetch funeral mass appointments
    try {
        $funeralSql = "SELECT 
                          f.funeralID as id,
                          COALESCE(d.first_name, f.firstName, '') as firstName, 
                          COALESCE(d.last_name, f.lastName, '') as lastName, 
                          f.clientID,
                          'Funeral Mass' as sacramentType, 
                          f.dateOfFuneralMass as date, 
                          f.timeOfFuneralMass as time, 
                          f.status, 
                          DATE(f.created_at) as createdAt,
                          'application' as appointmentSource
                       FROM 
                          funeral_mass_application f
                       LEFT JOIN 
                          deceased_info d ON f.funeralID = d.funeralID
                       WHERE 
                          f.clientID = ?
                       ORDER BY 
                          f.created_at DESC";
        
        $stmt = $conn->prepare($funeralSql);
        if (!$stmt) {
            throw new Exception("Prepare failed for funeral: " . $conn->error);
        }
        $stmt->bind_param("i", $clientID);
        $stmt->execute();
        $funeralResult = $stmt->get_result();
        
        while ($row = $funeralResult->fetch_assoc()) {
            $allAppointments[] = $row;
        }
        $stmt->close();
    } catch (Exception $e) {
        error_log("Funeral query error: " . $e->getMessage());
        // Continue with other sacraments
    }
    
    // 4. Fetch blessing appointments
    try {
        $blessingSql = "SELECT 
                           b.blessingID as id, 
                           b.firstName as firstName, 
                           b.lastName as lastName, 
                           b.clientID,
                           'Blessing' as sacramentType, 
                           b.preferredDate as date, 
                           b.preferredTime as time, 
                           b.status, 
                           DATE(b.dateCreated) as createdAt,
                           'application' as appointmentSource
                        FROM 
                           blessing_application b
                        WHERE 
                           b.clientID = ?
                        ORDER BY 
                           b.dateCreated DESC";
        
        $stmt = $conn->prepare($blessingSql);
        if (!$stmt) {
            throw new Exception("Prepare failed for blessing: " . $conn->error);
        }
        $stmt->bind_param("i", $clientID);
        $stmt->execute();
        $blessingResult = $stmt->get_result();
        
        while ($row = $blessingResult->fetch_assoc()) {
            $allAppointments[] = $row;
        }
        $stmt->close();
    } catch (Exception $e) {
        error_log("Blessing query error: " . $e->getMessage());
        // Continue with other sacraments
    }
    
    // 5. Fetch communion appointments
    try {
        $communionSql = "SELECT 
                            communionID as id, 
                            first_name as firstName, 
                            last_name as lastName, 
                            clientID,
                            'Communion' as sacramentType, 
                            date, 
                            time, 
                            status, 
                            DATE(created_at) as createdAt,
                            'application' as appointmentSource
                         FROM 
                            communion_application
                         WHERE 
                             clientID = ?
                         ORDER BY 
                            created_at DESC";
        
        $stmt = $conn->prepare($communionSql);
        if (!$stmt) {
            throw new Exception("Prepare failed for communion: " . $conn->error);
        }
        $stmt->bind_param("i", $clientID);
        $stmt->execute();
        $communionResult = $stmt->get_result();
        
        while ($row = $communionResult->fetch_assoc()) {
            $allAppointments[] = $row;
        }
        $stmt->close();
    } catch (Exception $e) {
        error_log("Communion query error: " . $e->getMessage());
        // Continue with other sacraments
    }
    
    // 6. Fetch confirmation appointments
    try {
        $confirmationSql = "SELECT 
                               confirmationID as id, 
                               first_name as firstName, 
                               last_name as lastName, 
                               clientID,
                               'Confirmation' as sacramentType, 
                               date, 
                               time, 
                               status, 
                               DATE(created_at) as createdAt,
                               'application' as appointmentSource
                            FROM 
                               confirmation_application
                            WHERE 
                                clientID = ?
                            ORDER BY 
                               created_at DESC";
        
        $stmt = $conn->prepare($confirmationSql);
        if (!$stmt) {
            throw new Exception("Prepare failed for confirmation: " . $conn->error);
        }
        $stmt->bind_param("i", $clientID);
        $stmt->execute();
        $confirmationResult = $stmt->get_result();
        
        while ($row = $confirmationResult->fetch_assoc()) {
            $allAppointments[] = $row;
        }
        $stmt->close();
    } catch (Exception $e) {
        error_log("Confirmation query error: " . $e->getMessage());
        // Continue with other sacraments
    }
    
    // 7. Fetch anointing appointments
    try {
        $anointingSql = "SELECT 
                            anointingID as id, 
                            firstName as firstName, 
                            lastName as lastName, 
                            clientID,
                            'Anointing of the Sick and Viaticum' as sacramentType, 
                            dateOfAnointing as date, 
                            timeOfAnointing as time, 
                            status, 
                            DATE(dateCreated) as createdAt,
                            'application' as appointmentSource
                         FROM 
                            anointing_application
                         WHERE 
                            clientID = ?
                         ORDER BY 
                            dateCreated DESC";
        
        $stmt = $conn->prepare($anointingSql);
        if (!$stmt) {
            throw new Exception("Prepare failed for anointing: " . $conn->error);
        }
        $stmt->bind_param("i", $clientID);
        $stmt->execute();
        $anointingResult = $stmt->get_result();
        
        while ($row = $anointingResult->fetch_assoc()) {
            $allAppointments[] = $row;
        }
        $stmt->close();
    } catch (Exception $e) {
        error_log("Anointing query error: " . $e->getMessage());
        // Continue with other sacraments
    }
    
    // 8. NEW: Fetch approved appointments (ceremony dates)
    try {
        $approvedSql = "SELECT 
                           aa.appointmentID as id,
                           aa.sacramentID,
                           aa.sacrament_type as sacramentType,
                           aa.date,
                           aa.time,
                           aa.priest,
                           'Approved Ceremony' as status,
                           DATE(aa.created_at) as createdAt,
                           'approved_ceremony' as appointmentSource,
                           CASE 
                               WHEN aa.sacrament_type = 'Baptism' THEN 
                                   (SELECT CONCAT(b.firstName, ' ', b.lastName) FROM baptism_application b WHERE b.baptismID = aa.sacramentID AND b.clientID = ?)
                               WHEN aa.sacrament_type = 'Marriage' THEN 
                                   (SELECT CONCAT(m.groom_first_name, ' ', m.groom_last_name) FROM marriage_application m WHERE m.marriageID = aa.sacramentID AND m.clientID = ?)
                               WHEN aa.sacrament_type = 'Funeral Mass' THEN 
                                   (SELECT CONCAT(COALESCE(d.first_name, f.firstName, ''), ' ', COALESCE(d.last_name, f.lastName, '')) 
                                    FROM funeral_mass_application f 
                                    LEFT JOIN deceased_info d ON f.funeralID = d.funeralID 
                                    WHERE f.funeralID = aa.sacramentID AND f.clientID = ?)
                               WHEN aa.sacrament_type = 'Blessing' THEN 
                                   (SELECT CONCAT(b.firstName, ' ', b.lastName) FROM blessing_application b WHERE b.blessingID = aa.sacramentID AND b.clientID = ?)
                               WHEN aa.sacrament_type = 'Communion' THEN 
                                   (SELECT CONCAT(c.first_name, ' ', c.last_name) FROM communion_application c WHERE c.communionID = aa.sacramentID AND c.clientID = ?)
                               WHEN aa.sacrament_type = 'Confirmation' THEN 
                                   (SELECT CONCAT(c.first_name, ' ', c.last_name) FROM confirmation_application c WHERE c.confirmationID = aa.sacramentID AND c.clientID = ?)
                               WHEN aa.sacrament_type = 'Anointing of the Sick and Viaticum' THEN 
                                   (SELECT CONCAT(a.firstName, ' ', a.lastName) FROM anointing_application a WHERE a.anointingID = aa.sacramentID AND a.clientID = ?)
                               ELSE 'Unknown'
                           END as fullName
                        FROM 
                           approved_appointments aa
                        WHERE 
                           aa.sacramentID IN (
                               SELECT baptismID FROM baptism_application WHERE clientID = ?
                               UNION
                               SELECT marriageID FROM marriage_application WHERE clientID = ?
                               UNION
                               SELECT funeralID FROM funeral_mass_application WHERE clientID = ?
                               UNION
                               SELECT blessingID FROM blessing_application WHERE clientID = ?
                               UNION
                               SELECT communionID FROM communion_application WHERE clientID = ?
                               UNION
                               SELECT confirmationID FROM confirmation_application WHERE clientID = ?
                               UNION
                               SELECT anointingID FROM anointing_application WHERE clientID = ?
                           )
                        ORDER BY 
                           aa.created_at DESC";
        
        $stmt = $conn->prepare($approvedSql);
        if (!$stmt) {
            throw new Exception("Prepare failed for approved appointments: " . $conn->error);
        }
        
        // Bind parameters (7 times for the CASE statement + 7 times for the UNION)
        $stmt->bind_param("iiiiiiiiiiiiii", 
            $clientID, $clientID, $clientID, $clientID, $clientID, $clientID, $clientID,
            $clientID, $clientID, $clientID, $clientID, $clientID, $clientID, $clientID
        );
        
        $stmt->execute();
        $approvedResult = $stmt->get_result();
        
        while ($row = $approvedResult->fetch_assoc()) {
            // Split the fullName into firstName and lastName
            $nameParts = explode(' ', trim($row['fullName']), 2);
            $row['firstName'] = $nameParts[0] ?? '';
            $row['lastName'] = $nameParts[1] ?? '';
            $row['clientID'] = $clientID; // Add clientID for consistency
            
            // Remove the fullName field as we've split it
            unset($row['fullName']);
            
            $allAppointments[] = $row;
        }
        $stmt->close();
    } catch (Exception $e) {
        error_log("Approved appointments query error: " . $e->getMessage());
        // Continue without approved appointments
    }
    
    $conn->close();
    
    echo json_encode([
        "success" => true,
        "appointments" => $allAppointments,
        "clientID" => $clientID,
        "total_count" => count($allAppointments)
    ]);

} catch (Exception $e) {
    error_log("Fetch client appointments error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred while fetching appointments: " . $e->getMessage(),
        "clientID" => isset($clientID) ? $clientID : null
    ]);
}
?>