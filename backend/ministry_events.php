<?php
// Disable HTML error reporting and enable JSON error responses
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set JSON header at the very beginning
header("Content-Type: application/json; charset=UTF-8");

try {
    // Start session
    session_start();

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

    // Handle GET request - Fetch events
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get userID from query parameter (optional)
        $userID = isset($_GET['userID']) ? $_GET['userID'] : null;
        
        // Build the query
        $sql = "SELECT * FROM activity";
        
        // Add userID filter if provided
        if ($userID) {
            $sql .= " WHERE userID = " . $conn->real_escape_string($userID);
        }
        
        // Order by most recent first
        $sql .= " ORDER BY activityID DESC";
        
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception("Error fetching events: " . $conn->error);
        }
        
        $events = [];
        while ($row = $result->fetch_assoc()) {
            $events[] = $row;
        }
        
        echo json_encode([
            "success" => true,
            "events" => $events
        ]);
    }
    
    // Handle POST request - Create new event
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Read and decode JSON data from the request
        $json = file_get_contents("php://input");
        $data = json_decode($json);
        
        // Check if JSON parsing failed
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON: " . json_last_error_msg());
        }
        
        // Validate received data
        if (!$data || !isset($data->userID, $data->title, $data->description, $data->category, 
                            $data->startDate, $data->startTime, $data->location, $data->organizer)) {
            throw new Exception("Missing required fields for event creation.");
        }
        
        // Prepare and bind parameters
        $stmt = $conn->prepare("INSERT INTO activity (userID, title, description, category, startDate, 
                                startTime, location, organizer, nameOfParish, status) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        // Default status to "Pending" and nameOfParish to "N/A" for ministry
        $status = "Pending";
        $nameOfParish = "N/A";
        
        $stmt->bind_param("isssssssss", 
            $data->userID,
            $data->title, 
            $data->description, 
            $data->category,
            $data->startDate,
            $data->startTime,
            $data->location,
            $data->organizer,
            $nameOfParish,
            $status
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $newEventId = $stmt->insert_id;
        $stmt->close();
        
        echo json_encode([
            "success" => true,
            "message" => "Event created successfully",
            "eventID" => $newEventId
        ]);
    }
    
    // Handle PUT request - Update event
    elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Read and decode JSON data from the request
        $json = file_get_contents("php://input");
        $data = json_decode($json);
        
        // Check if JSON parsing failed
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON: " . json_last_error_msg());
        }
        
        // Validate received data
        if (!$data || !isset($data->activityID)) {
            throw new Exception("Activity ID is required for updating an event.");
        }
        
        // Start building the query
        $sql = "UPDATE activity SET ";
        $params = [];
        $types = "";
        
        // Add fields to update
        if (isset($data->title)) {
            $sql .= "title = ?, ";
            $params[] = $data->title;
            $types .= "s";
        }
        
        if (isset($data->description)) {
            $sql .= "description = ?, ";
            $params[] = $data->description;
            $types .= "s";
        }
        
        if (isset($data->category)) {
            $sql .= "category = ?, ";
            $params[] = $data->category;
            $types .= "s";
        }
        
        if (isset($data->startDate)) {
            $sql .= "startDate = ?, ";
            $params[] = $data->startDate;
            $types .= "s";
        }
        
        if (isset($data->startTime)) {
            $sql .= "startTime = ?, ";
            $params[] = $data->startTime;
            $types .= "s";
        }
        
        if (isset($data->location)) {
            $sql .= "location = ?, ";
            $params[] = $data->location;
            $types .= "s";
        }
        
        if (isset($data->organizer)) {
            $sql .= "organizer = ?, ";
            $params[] = $data->organizer;
            $types .= "s";
        }
        
        if (isset($data->status)) {
            $sql .= "status = ?, ";
            $params[] = $data->status;
            $types .= "s";
        }
        
        // Remove trailing comma and space
        $sql = rtrim($sql, ", ");
        
        // Add WHERE clause
        $sql .= " WHERE activityID = ?";
        $params[] = $data->activityID;
        $types .= "i";
        
        // Prepare and execute the statement
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param($types, ...$params);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                "success" => true,
                "message" => "Event updated successfully"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "No changes made or event not found"
            ]);
        }
        
        $stmt->close();
    }
    
    else {
        http_response_code(405);
        echo json_encode([
            "success" => false,
            "message" => "Method not allowed"
        ]);
    }
    
    $conn->close();

} catch (Exception $e) {
    error_log("Ministry events error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred. Please try again later.",
        "debug" => $e->getMessage() // Remove this line in production
    ]);
}
?>