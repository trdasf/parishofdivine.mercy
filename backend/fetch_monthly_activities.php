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
    
    // Get status filter from query parameter (optional)
    $statusFilter = isset($_GET['status']) ? $_GET['status'] : null;
    
    // Build the query - join with user_management to get proposer info
    $sql = "SELECT a.*, u.firstName, u.lastName 
            FROM activity a
            LEFT JOIN user_management u ON a.userID = u.userID
            WHERE MONTH(a.startDate) = ? AND YEAR(a.startDate) = ?";
    
    // Add status filter if provided
    if ($statusFilter) {
        $sql .= " AND a.status = ?";
    }
    
    // Order by most recent first
    $sql .= " ORDER BY a.startDate ASC, a.startTime ASC";
    
    // Prepare and execute the query
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    if ($statusFilter) {
        $stmt->bind_param("iis", $currentMonth, $currentYear, $statusFilter);
    } else {
        $stmt->bind_param("ii", $currentMonth, $currentYear);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    // Fetch activities
    $activities = [];
    while ($row = $result->fetch_assoc()) {
        // Add proposer full name
        $row['proposedBy'] = $row['firstName'] . ' ' . $row['lastName'];
        
        // Format date for consistency
        if (isset($row['startDate'])) {
            $startDate = new DateTime($row['startDate']);
            $row['start_date'] = $startDate->format('Y-m-d'); // Add standardized field name for frontend
        }
        
        $activities[] = $row;
    }
    
    $stmt->close();
    $conn->close();
    
    echo json_encode([
        "success" => true,
        "month" => $currentMonth,
        "year" => $currentYear,
        "activities" => $activities
    ]);

} catch (Exception $e) {
    error_log("Error fetching monthly activities: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>