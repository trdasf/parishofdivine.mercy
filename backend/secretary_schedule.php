<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Log errors to a file
ini_set('log_errors', 1);
ini_set('error_log', 'secretary_schedule_error.log');

// Set JSON header at the very beginning
header("Content-Type: application/json; charset=UTF-8");

try {
    // Log request method for debugging
    error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
    
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

    // Log database connection attempt
    error_log("Attempting database connection to: $servername, $dbname");

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check the database connection
    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
    
    error_log("Database connection successful");

    // GET request - Fetch all schedules
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $sql = "SELECT s.scheduleID, s.date, s.time, s.sacrament_type as sacramentType, s.createdAt, s.scheduleCode 
                FROM schedule s
                ORDER BY s.date ASC, s.time ASC";
        
        $result = $conn->query($sql);

        if (!$result) {
            throw new Exception("Error fetching schedules: " . $conn->error);
        }

        $schedules = array();
        while ($row = $result->fetch_assoc()) {
            // Format the dates correctly
            $createdAt = $row['createdAt'] ? date('Y-m-d H:i:s', strtotime($row['createdAt'])) : null;
            
            $schedules[] = array(
                'id' => $row['scheduleID'],
                'date' => $row['date'],
                'time' => $row['time'],
                'sacramentType' => $row['sacramentType'],
                'createdAt' => $createdAt,
                'scheduleCode' => $row['scheduleCode']
            );
        }

        echo json_encode([
            "success" => true,
            "schedules" => $schedules
        ]);
    }
    // POST request - Add a new schedule
    else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Read and decode JSON data from the request
        $jsonData = file_get_contents("php://input");
        error_log("Received POST data: " . $jsonData);
        
        $data = json_decode($jsonData);

        // Check if JSON parsing failed
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON parsing error: " . json_last_error_msg());
            throw new Exception("Invalid JSON: " . json_last_error_msg());
        }

        // Validate received data
        if (!$data) {
            error_log("No data received");
            throw new Exception("No data received");
        }

        if (!isset($data->sacramentType) || !isset($data->date) || !isset($data->time)) {
            error_log("Incomplete data: " . json_encode([
                'sacramentType' => isset($data->sacramentType),
                'date' => isset($data->date),
                'time' => isset($data->time)
            ]));
            throw new Exception("Incomplete data provided. Please fill in all required fields.");
        }

        // Sanitize input data
        $sacrament_type = $conn->real_escape_string($data->sacramentType);
        $date = $conn->real_escape_string($data->date);
        $time = $conn->real_escape_string($data->time);
        $scheduleCode = isset($data->scheduleCode) ? $conn->real_escape_string($data->scheduleCode) : null;
        
        error_log("Sanitized data: " . json_encode([
            'sacrament_type' => $sacrament_type,
            'date' => $date,
            'time' => $time,
            'scheduleCode' => $scheduleCode
        ]));
        
        // Check if a schedule with the same date and time already exists
        $checkStmt = $conn->prepare("SELECT scheduleID FROM schedule WHERE date = ? AND time = ?");
        if (!$checkStmt) {
            throw new Exception("Database prepare error for duplicate check: " . $conn->error);
        }
        
        $checkStmt->bind_param("ss", $date, $time);
        
        if (!$checkStmt->execute()) {
            throw new Exception("Database execute error for duplicate check: " . $checkStmt->error);
        }
        
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            http_response_code(409); // Conflict status code
            echo json_encode([
                "success" => false, 
                "message" => "A schedule with the same date and time already exists.",
                "error" => "date_time_conflict"
            ]);
            $checkStmt->close();
            $conn->close();
            exit();
        }
        
        $checkStmt->close();
        
        // Generate schedule code if not provided
        if (!$scheduleCode) {
            $currentYear = date('Y');
            
            // Count existing schedules for this year to generate a unique code
            $codeStmt = $conn->prepare("SELECT COUNT(*) as count FROM schedule WHERE scheduleCode LIKE ?");
            if (!$codeStmt) {
                throw new Exception("Database prepare error for code generation: " . $conn->error);
            }
            
            $codePattern = "SCH-" . $currentYear . "-%";
            $codeStmt->bind_param("s", $codePattern);
            
            if (!$codeStmt->execute()) {
                throw new Exception("Database execute error for code generation: " . $codeStmt->error);
            }
            
            $codeResult = $codeStmt->get_result();
            $codeRow = $codeResult->fetch_assoc();
            $count = $codeRow['count'] + 1;
            $scheduleCode = "SCH-" . $currentYear . "-" . str_pad($count, 4, "0", STR_PAD_LEFT);
            $codeStmt->close();
        }
        
        // Current timestamp for createdAt
        $createdAt = date('Y-m-d H:i:s');
        
        // Insert the new schedule
        $stmt = $conn->prepare("INSERT INTO schedule (sacrament_type, date, time, createdAt, scheduleCode) VALUES (?, ?, ?, ?, ?)");
        if (!$stmt) {
            throw new Exception("Database prepare error: " . $conn->error);
        }

        $stmt->bind_param("sssss", $sacrament_type, $date, $time, $createdAt, $scheduleCode);

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
        if (!$data || !isset($data->id, $data->sacramentType, $data->date, $data->time)) {
            throw new Exception("Incomplete data provided. Please fill in all required fields.");
        }

        // Sanitize input data
        $scheduleID = (int)$data->id;
        $sacrament_type = $conn->real_escape_string($data->sacramentType);
        $date = $conn->real_escape_string($data->date);
        $time = $conn->real_escape_string($data->time);
        
        // Check if another schedule with the same date and time already exists (excluding current schedule)
        $checkStmt = $conn->prepare("SELECT scheduleID FROM schedule WHERE date = ? AND time = ? AND scheduleID != ?");
        if (!$checkStmt) {
            throw new Exception("Database prepare error for duplicate check: " . $conn->error);
        }
        
        $checkStmt->bind_param("ssi", $date, $time, $scheduleID);
        
        if (!$checkStmt->execute()) {
            throw new Exception("Database execute error for duplicate check: " . $checkStmt->error);
        }
        
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            http_response_code(409); // Conflict status code
            echo json_encode([
                "success" => false, 
                "message" => "Another schedule with the same date and time already exists.",
                "error" => "date_time_conflict"
            ]);
            $checkStmt->close();
            $conn->close();
            exit();
        }
        
        $checkStmt->close();
        
        // Update the schedule
        $stmt = $conn->prepare("UPDATE schedule SET sacrament_type = ?, date = ?, time = ? WHERE scheduleID = ?");
        if (!$stmt) {
            throw new Exception("Database prepare error: " . $conn->error);
        }

        $stmt->bind_param("sssi", $sacrament_type, $date, $time, $scheduleID);

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
    error_log("Schedule API error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred. Please try again later.",
        "error" => $e->getMessage()  // Include error message for debugging
    ]);
}
?>