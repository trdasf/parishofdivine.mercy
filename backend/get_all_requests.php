<?php
// Disable HTML error reporting and enable JSON error responses
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set JSON header at the very beginning
header("Content-Type: application/json; charset=UTF-8");

try {
    // CORS headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    // Handle preflight request (OPTIONS)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    // Only allow GET requests
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception("Only GET requests are allowed");
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

    $allRequests = [];

    // Query each table separately and combine results
    
    // 1. Baptism requests
    $baptismQuery = "SELECT 
        reqbaptismID as originalID,
        'Baptism' as sacramentType,
        first_name,
        middle_name,
        last_name,
        date as dateSubmitted
    FROM request_baptism 
    ORDER BY date DESC";
    
    $baptismResult = $conn->query($baptismQuery);
    if ($baptismResult) {
        while ($row = $baptismResult->fetch_assoc()) {
            $allRequests[] = [
                'originalID' => $row['originalID'],
                'originalType' => 'reqbaptismID',
                'sacramentType' => $row['sacramentType'],
                'firstName' => $row['first_name'],
                'middleName' => $row['middle_name'] ?: '',
                'lastName' => $row['last_name'],
                'dateSubmitted' => $row['dateSubmitted']
            ];
        }
    }

    // 2. Marriage requests
    $marriageQuery = "SELECT 
        reqmarriageID as originalID,
        'Marriage' as sacramentType,
        groom_fname as first_name,
        groom_mname as middle_name,
        groom_lname as last_name,
        date as dateSubmitted
    FROM request_marriage 
    ORDER BY date DESC";
    
    $marriageResult = $conn->query($marriageQuery);
    if ($marriageResult) {
        while ($row = $marriageResult->fetch_assoc()) {
            $allRequests[] = [
                'originalID' => $row['originalID'],
                'originalType' => 'reqmarriageID',
                'sacramentType' => $row['sacramentType'],
                'firstName' => $row['first_name'],
                'middleName' => $row['middle_name'] ?: '',
                'lastName' => $row['last_name'],
                'dateSubmitted' => $row['dateSubmitted']
            ];
        }
    }

    // 3. Communion requests
    $communionQuery = "SELECT 
        reqcommunionID as originalID,
        'Communion' as sacramentType,
        first_name,
        middle_name,
        last_name,
        date as dateSubmitted
    FROM request_communion 
    ORDER BY date DESC";
    
    $communionResult = $conn->query($communionQuery);
    if ($communionResult) {
        while ($row = $communionResult->fetch_assoc()) {
            $allRequests[] = [
                'originalID' => $row['originalID'],
                'originalType' => 'reqcommunionID',
                'sacramentType' => $row['sacramentType'],
                'firstName' => $row['first_name'],
                'middleName' => $row['middle_name'] ?: '',
                'lastName' => $row['last_name'],
                'dateSubmitted' => $row['dateSubmitted']
            ];
        }
    }

    // 4. Confirmation requests
    $confirmationQuery = "SELECT 
        reqconfirmationID as originalID,
        'Confirmation' as sacramentType,
        first_name,
        middle_name,
        last_name,
        date as dateSubmitted
    FROM request_confirmation 
    ORDER BY date DESC";
    
    $confirmationResult = $conn->query($confirmationQuery);
    if ($confirmationResult) {
        while ($row = $confirmationResult->fetch_assoc()) {
            $allRequests[] = [
                'originalID' => $row['originalID'],
                'originalType' => 'reqconfirmationID',
                'sacramentType' => $row['sacramentType'],
                'firstName' => $row['first_name'],
                'middleName' => $row['middle_name'] ?: '',
                'lastName' => $row['last_name'],
                'dateSubmitted' => $row['dateSubmitted']
            ];
        }
    }

    // Sort all requests by date (newest first)
    usort($allRequests, function($a, $b) {
        return strtotime($b['dateSubmitted']) - strtotime($a['dateSubmitted']);
    });

    // Add sequential ID for display
    foreach ($allRequests as $index => &$request) {
        $request['displayID'] = $index + 1;
        
        // Format date for display
        $request['formattedDate'] = date('Y-m-d', strtotime($request['dateSubmitted']));
    }

    $conn->close();

    // Return successful response
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "All certificate requests retrieved successfully",
        "data" => $allRequests,
        "count" => count($allRequests)
    ]);

} catch (Exception $e) {
    error_log("Get all requests error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "data" => [],
        "count" => 0
    ]);
}
?>