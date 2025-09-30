<?php
// Disable HTML error reporting and enable JSON error responses
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set JSON header at the very beginning
header("Content-Type: application/json; charset=UTF-8");

try {
    // CORS headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    // Handle preflight request (OPTIONS)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    // Only allow POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Only POST requests are allowed");
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

    // Read and decode JSON data from the request
    $json = file_get_contents("php://input");
    $data = json_decode($json);

    // Check if JSON parsing failed
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON: " . json_last_error_msg());
    }

    // Validate received data
    if (!$data || !isset($data->groomFirstName, $data->groomLastName, $data->brideFirstName, 
                         $data->brideLastName, $data->placeOfMarriage, $data->dateOfMarriage)) {
        throw new Exception("Incomplete data provided. Please fill in all required fields.");
    }

    // Sanitize input data
    $groom_fname = $conn->real_escape_string(trim($data->groomFirstName));
    $groom_mname = isset($data->groomMiddleName) ? $conn->real_escape_string(trim($data->groomMiddleName)) : '';
    $groom_lname = $conn->real_escape_string(trim($data->groomLastName));
    
    $bride_fname = $conn->real_escape_string(trim($data->brideFirstName));
    $bride_mname = isset($data->brideMiddleName) ? $conn->real_escape_string(trim($data->brideMiddleName)) : '';
    $bride_lname = $conn->real_escape_string(trim($data->brideLastName));
    
    $place_of_marriage = $conn->real_escape_string(trim($data->placeOfMarriage));
    $date_of_marriage = $conn->real_escape_string(trim($data->dateOfMarriage));
    $name_of_priest = isset($data->officiatingPriest) ? $conn->real_escape_string(trim($data->officiatingPriest)) : '';
    
    // Get clientID if provided (for logged-in users)
    $clientID = isset($data->clientID) ? intval($data->clientID) : null;

    // Validate date format
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_of_marriage)) {
        throw new Exception("Invalid date format for marriage date. Please use YYYY-MM-DD format.");
    }

    // Process purposes
    $purposes = [];
    if (isset($data->purposeCivil) && $data->purposeCivil) {
        $purposes[] = "Civil Requirement";
    }
    if (isset($data->purposeChurch) && $data->purposeChurch) {
        $purposes[] = "Church Requirement (e.g., renewal, canonical processing)";
    }
    if (isset($data->purposePersonal) && $data->purposePersonal) {
        $purposes[] = "Personal Record";
    }
    if (isset($data->purposeOthers) && $data->purposeOthers && isset($data->othersText) && !empty(trim($data->othersText))) {
        $purposes[] = "Others: " . $conn->real_escape_string(trim($data->othersText));
    }

    // Validate that at least one purpose is selected
    if (empty($purposes)) {
        throw new Exception("Please select at least one purpose for the marriage certificate request.");
    }

    // Convert purposes array to string
    $purpose_string = implode(", ", $purposes);

    // Insert the marriage certificate request
    $stmt = $conn->prepare("INSERT INTO request_marriage (clientID, groom_fname, groom_mname, groom_lname, bride_fname, bride_mname, bride_lname, place_of_marriage, date_of_marriage, name_of_priest, purpose) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->bind_param("issssssssss", 
        $clientID, 
        $groom_fname, $groom_mname, $groom_lname,
        $bride_fname, $bride_mname, $bride_lname,
        $place_of_marriage, $date_of_marriage, $name_of_priest,
        $purpose_string
    );

    if ($stmt->execute()) {
        $request_id = $conn->insert_id;
        
        http_response_code(201); // Created status code
        echo json_encode([
            "success" => true, 
            "message" => "Marriage certificate request submitted successfully.",
            "requestID" => $request_id,
            "data" => [
                "reqmarriageID" => $request_id,
                "groom_full_name" => $groom_fname . " " . ($groom_mname ? $groom_mname . " " : "") . $groom_lname,
                "bride_full_name" => $bride_fname . " " . ($bride_mname ? $bride_mname . " " : "") . $bride_lname,
                "purpose" => $purpose_string,
                "date_submitted" => date('Y-m-d H:i:s')
            ]
        ]);
    } else {
        throw new Exception("Database error: " . $stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    error_log("Marriage certificate request error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "debug" => $e->getMessage() // Remove this line in production
    ]);
}
?>