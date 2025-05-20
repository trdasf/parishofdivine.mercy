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
    header("Access-Control-Allow-Methods: GET, PUT, OPTIONS");
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

    // Handle GET request - Fetch activities with proposer info
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get status filter from query parameter (optional)
        $statusFilter = isset($_GET['status']) ? $_GET['status'] : null;
        
        // Build the query - join with user_management to get proposer info
        $sql = "SELECT a.*, u.firstName, u.lastName 
                FROM activity a
                LEFT JOIN user_management u ON a.userID = u.userID";
        
        // Add status filter if provided
        if ($statusFilter) {
            $sql .= " WHERE a.status = '" . $conn->real_escape_string($statusFilter) . "'";
        }
        
        // Order by most recent first
        $sql .= " ORDER BY a.activityID DESC";
        
        $result = $conn->query($sql);
        
        if (!$result) {
            throw new Exception("Error fetching activities: " . $conn->error);
        }
        
        $activities = [];
        while ($row = $result->fetch_assoc()) {
            // Add proposer full name
            $row['proposedBy'] = $row['firstName'] . ' ' . $row['lastName'];
            $activities[] = $row;
        }
        
        echo json_encode([
            "success" => true,
            "activities" => $activities
        ]);
    }
    
    // Handle PUT request - Update activity status
    elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Read and decode JSON data from the request
        $json = file_get_contents("php://input");
        $data = json_decode($json);
        
        // Check if JSON parsing failed
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON: " . json_last_error_msg());
        }
        
        // Validate received data
        if (!$data || !isset($data->activityID, $data->status)) {
            throw new Exception("Activity ID and status are required for updating an activity.");
        }
        
        // Prepare the update statement
        $stmt = $conn->prepare("UPDATE activity SET status = ? WHERE activityID = ?");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("si", $data->status, $data->activityID);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                "success" => true,
                "message" => "Activity status updated successfully"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "No changes made or activity not found"
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
    error_log("Fetch activities error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred. Please try again later.",
        "debug" => $e->getMessage() // Remove this line in production
    ]);
}
?> 