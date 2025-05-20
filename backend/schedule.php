<?php
// Disable HTML error reporting and enable JSON error responses
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set JSON header at the very beginning
header("Content-Type: application/json; charset=UTF-8");

try {
    // CORS headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    // Handle preflight request (OPTIONS)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    // Database connection setup
    $servername = "localhost";
    $username = "u572625467_divine_mercy";  
    $password = "Parish_12345";   
    $dbname = "u572625467_parish";  

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check the database connection
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    // GET request - Fetch all schedules
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        try {
            // Check if the schedule table exists
            $tableCheck = $conn->query("SHOW TABLES LIKE 'schedule'");
            if ($tableCheck->num_rows == 0) {
                throw new Exception("Table 'schedule' does not exist");
            }
            
            // Check schedule table structure
            $columnsCheck = $conn->query("SHOW COLUMNS FROM schedule");
            $columns = [];
            while ($column = $columnsCheck->fetch_assoc()) {
                $columns[] = $column['Field'];
            }
            
            // Debug info
            error_log("Available columns in schedule table: " . implode(", ", $columns));
            
            // Check if the parish table exists
            $parishTableCheck = $conn->query("SHOW TABLES LIKE 'parish'");
            if ($parishTableCheck->num_rows == 0) {
                throw new Exception("Table 'parish' does not exist");
            }
            
            // Check parish table structure
            $parishColumnsCheck = $conn->query("SHOW COLUMNS FROM parish");
            $parishColumns = [];
            while ($column = $parishColumnsCheck->fetch_assoc()) {
                $parishColumns[] = $column['Field'];
            }
            
            // Debug info
            error_log("Available columns in parish table: " . implode(", ", $parishColumns));
            
            // Check if the main columns we need exist
            if (!in_array('sacrament_type', $columns)) {
                throw new Exception("Column 'sacrament_type' does not exist in schedule table");
            }
            
            if (!in_array('parish_name', $parishColumns)) {
                throw new Exception("Column 'parish_name' does not exist in parish table");
            }
            
            $sql = "SELECT s.scheduleID, s.date, s.time, s.sacrament_type as sacramentType, p.parish_name as parishName 
                    FROM schedule s
                    LEFT JOIN parish p ON s.parishID = p.parishID
                    ORDER BY s.date ASC, s.time ASC";
            
            $result = $conn->query($sql);
            
            if (!$result) {
                // Try a simpler query without the join as fallback
                error_log("Join query failed, trying fallback: " . $conn->error);
                $fallbackSql = "SELECT scheduleID, date, time, sacrament_type as sacramentType, parishID 
                                FROM schedule 
                                ORDER BY date ASC, time ASC";
                $result = $conn->query($fallbackSql);
                
                if (!$result) {
                    throw new Exception("Error fetching schedules even with fallback: " . $conn->error);
                }
                
                // With fallback, we need to get parish names separately
                $schedules = array();
                while ($row = $result->fetch_assoc()) {
                    // Get parish name from parishID
                    $parishName = "Unknown"; // Default value
                    if ($row['parishID']) {
                        $parishStmt = $conn->prepare("SELECT parish_name FROM parish WHERE parishID = ?");
                        if ($parishStmt) {
                            $parishStmt->bind_param("i", $row['parishID']);
                            $parishStmt->execute();
                            $parishResult = $parishStmt->get_result();
                            if ($parishResult && $parishResult->num_rows > 0) {
                                $parishRow = $parishResult->fetch_assoc();
                                $parishName = $parishRow['parish_name'];
                            }
                            $parishStmt->close();
                        }
                    }
                    
                    $schedules[] = array(
                        'scheduleID' => $row['scheduleID'],
                        'date' => $row['date'],
                        'time' => $row['time'],
                        'sacramentType' => $row['sacramentType'],
                        'parishName' => $parishName
                    );
                }
            } else {
                // Original query worked
                $schedules = array();
                while ($row = $result->fetch_assoc()) {
                    $schedules[] = array(
                        'scheduleID' => $row['scheduleID'],
                        'date' => $row['date'],
                        'time' => $row['time'],
                        'sacramentType' => $row['sacramentType'],
                        'parishName' => $row['parishName'] ?: "Unknown"
                    );
                }
            }
            
            echo json_encode([
                "success" => true,
                "schedules" => $schedules
            ]);
        } catch (Exception $e) {
            error_log("Schedule API GET error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "An error occurred fetching schedules: " . $e->getMessage(),
                "debug" => $e->getMessage()
            ]);
            return;
        }
    }
    // POST request - Add a new schedule
    else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Read and decode JSON data from the request
        $json = file_get_contents("php://input");
        $data = json_decode($json);

        // Check if JSON parsing failed
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON: " . json_last_error_msg());
        }

        // Validate received data
        if (!$data || !isset($data->sacramentType, $data->parishName, $data->date, $data->time)) {
            throw new Exception("Incomplete data provided. Please fill in all required fields.");
        }

        // Sanitize input data
        $sacrament_type = $conn->real_escape_string($data->sacramentType);
        $parish_name = $conn->real_escape_string($data->parishName);
        $date = $conn->real_escape_string($data->date);
        $time = $conn->real_escape_string($data->time);
        
        // Get parishID from parish_name
        $stmt = $conn->prepare("SELECT parishID FROM parish WHERE parish_name = ?");
        if (!$stmt) {
            throw new Exception("Database prepare error: " . $conn->error);
        }

        $stmt->bind_param("s", $parish_name);
        if (!$stmt->execute()) {
            throw new Exception("Database execute error: " . $stmt->error);
        }

        $parishResult = $stmt->get_result();
        
        if ($parishResult->num_rows === 0) {
            http_response_code(404);
            echo json_encode([
                "success" => false, 
                "message" => "Parish not found.",
                "error" => "parish_not_found"
            ]);
            $stmt->close();
            $conn->close();
            exit();
        }
        
        $parishRow = $parishResult->fetch_assoc();
        $parishID = $parishRow['parishID'];
        $stmt->close();
        
        // Generate schedule code
        $currentYear = date('Y');
        
        // Count existing schedules for this year to generate a unique code
        $codeStmt = $conn->prepare("SELECT COUNT(*) as count FROM schedule WHERE scheduleCode LIKE ?");
        $codePattern = "SCH-" . $currentYear . "-%";
        $codeStmt->bind_param("s", $codePattern);
        $codeStmt->execute();
        $codeResult = $codeStmt->get_result();
        $codeRow = $codeResult->fetch_assoc();
        $count = $codeRow['count'] + 1;
        $scheduleCode = "SCH-" . $currentYear . "-" . str_pad($count, 4, "0", STR_PAD_LEFT);
        $codeStmt->close();
        
        // Current timestamp for createdAt
        $createdAt = date('Y-m-d H:i:s');
        
        // Insert the new schedule
        $stmt = $conn->prepare("INSERT INTO schedule (sacrament_type, parishID, date, time, createdAt, scheduleCode) VALUES (?, ?, ?, ?, ?, ?)");
        if (!$stmt) {
            throw new Exception("Database prepare error: " . $conn->error);
        }

        $stmt->bind_param("sissss", $sacrament_type, $parishID, $date, $time, $createdAt, $scheduleCode);

        if ($stmt->execute()) {
            http_response_code(201); // Created status code
            echo json_encode([
                "success" => true, 
                "message" => "Schedule added successfully.",
                "scheduleID" => $conn->insert_id,
                "scheduleCode" => $scheduleCode
            ]);
        } else {
            throw new Exception("Database error: " . $stmt->error);
        }

        $stmt->close();
    }
    // PUT request - Update an existing schedule
    else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Read and decode JSON data from the request
        $json = file_get_contents("php://input");
        $data = json_decode($json);

        // Check if JSON parsing failed
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON: " . json_last_error_msg());
        }

        // Validate received data
        if (!$data || !isset($data->id, $data->sacramentType, $data->parishName, $data->date, $data->time)) {
            throw new Exception("Incomplete data provided. Please fill in all required fields.");
        }

        // Sanitize input data
        $scheduleID = (int)$data->id;
        $sacrament_type = $conn->real_escape_string($data->sacramentType);
        $parish_name = $conn->real_escape_string($data->parishName);
        $date = $conn->real_escape_string($data->date);
        $time = $conn->real_escape_string($data->time);
        
        // Get parishID from parish_name
        $stmt = $conn->prepare("SELECT parishID FROM parish WHERE parish_name = ?");
        if (!$stmt) {
            throw new Exception("Database prepare error: " . $conn->error);
        }

        $stmt->bind_param("s", $parish_name);
        if (!$stmt->execute()) {
            throw new Exception("Database execute error: " . $stmt->error);
        }

        $parishResult = $stmt->get_result();
        
        if ($parishResult->num_rows === 0) {
            http_response_code(404);
            echo json_encode([
                "success" => false, 
                "message" => "Parish not found.",
                "error" => "parish_not_found"
            ]);
            $stmt->close();
            $conn->close();
            exit();
        }
        
        $parishRow = $parishResult->fetch_assoc();
        $parishID = $parishRow['parishID'];
        $stmt->close();
        
        // Update the schedule
        $stmt = $conn->prepare("UPDATE schedule SET sacrament_type = ?, parishID = ?, date = ?, time = ? WHERE scheduleID = ?");
        if (!$stmt) {
            throw new Exception("Database prepare error: " . $conn->error);
        }

        $stmt->bind_param("sissi", $sacrament_type, $parishID, $date, $time, $scheduleID);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    "success" => true, 
                    "message" => "Schedule updated successfully."
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    "success" => false, 
                    "message" => "Schedule not found or no changes made.",
                    "error" => "schedule_not_found"
                ]);
            }
        } else {
            throw new Exception("Database error: " . $stmt->error);
        }

        $stmt->close();
    } else {
        http_response_code(405);
        echo json_encode([
            "success" => false,
            "message" => "Method not allowed"
        ]);
    }

    $conn->close();

} catch (Exception $e) {
    error_log("Schedule API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred. Please try again later.",
        "debug" => $e->getMessage() // Remove this line in production
    ]);
}
?>