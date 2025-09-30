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
    if (!$data || !isset($data->firstName, $data->lastName, $data->fatherFirstName, $data->fatherLastName, 
                         $data->motherFirstName, $data->motherLastName, $data->placeOfConfirmation, $data->dateOfConfirmation)) {
        throw new Exception("Incomplete data provided. Please fill in all required fields.");
    }

    // Sanitize input data
    $first_name = $conn->real_escape_string(trim($data->firstName));
    $middle_name = isset($data->middleName) ? $conn->real_escape_string(trim($data->middleName)) : '';
    $last_name = $conn->real_escape_string(trim($data->lastName));
    
    $father_fname = $conn->real_escape_string(trim($data->fatherFirstName));
    $father_mname = isset($data->fatherMiddleName) ? $conn->real_escape_string(trim($data->fatherMiddleName)) : '';
    $father_lname = $conn->real_escape_string(trim($data->fatherLastName));
    
    $mother_fname = $conn->real_escape_string(trim($data->motherFirstName));
    $mother_mname = isset($data->motherMiddleName) ? $conn->real_escape_string(trim($data->motherMiddleName)) : '';
    $mother_lname = $conn->real_escape_string(trim($data->motherLastName));
    
    $place_of_confirmation = $conn->real_escape_string(trim($data->placeOfConfirmation));
    $date_of_confirmation = $conn->real_escape_string(trim($data->dateOfConfirmation));
    $name_of_priest = isset($data->priestName) ? $conn->real_escape_string(trim($data->priestName)) : '';
    
    // Get clientID if provided (for logged-in users)
    $clientID = isset($data->clientID) ? intval($data->clientID) : null;

    // Validate date format
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_of_confirmation)) {
        throw new Exception("Invalid date format for confirmation date. Please use YYYY-MM-DD format.");
    }

    // Process purposes
    $purposes = [];
    if (isset($data->purposeMarriage) && $data->purposeMarriage) {
        $purposes[] = "Marriage Preparation";
    }
    if (isset($data->purposeSchool) && $data->purposeSchool) {
        $purposes[] = "School Requirement";
    }
    if (isset($data->purposeChurch) && $data->purposeChurch) {
        $purposes[] = "Church Requirement";
    }
    if (isset($data->purposePersonal) && $data->purposePersonal) {
        $purposes[] = "Personal Record";
    }
    if (isset($data->purposeOthers) && $data->purposeOthers && isset($data->othersText) && !empty(trim($data->othersText))) {
        $purposes[] = "Others: " . $conn->real_escape_string(trim($data->othersText));
    }

    // Validate that at least one purpose is selected
    if (empty($purposes)) {
        throw new Exception("Please select at least one purpose for the confirmation certificate request.");
    }

    // Convert purposes array to string
    $purpose_string = implode(", ", $purposes);

    // Insert the confirmation certificate request
    $stmt = $conn->prepare("INSERT INTO request_confirmation (clientID, first_name, middle_name, last_name, father_fname, father_mname, father_lname, mother_fname, mother_mname, mother_lname, place_of_confirmation, date_of_confirmation, name_of_priest, purpose) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->bind_param("isssssssssssss", 
        $clientID,
        $first_name, $middle_name, $last_name,
        $father_fname, $father_mname, $father_lname,
        $mother_fname, $mother_mname, $mother_lname,
        $place_of_confirmation, $date_of_confirmation, $name_of_priest,
        $purpose_string
    );

    if ($stmt->execute()) {
        $request_id = $conn->insert_id;
        
        http_response_code(201); // Created status code
        echo json_encode([
            "success" => true, 
            "message" => "Confirmation certificate request submitted successfully.",
            "requestID" => $request_id,
            "data" => [
                "reqconfirmationID" => $request_id,
                "full_name" => $first_name . " " . ($middle_name ? $middle_name . " " : "") . $last_name,
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
    error_log("Confirmation certificate request error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
        "debug" => $e->getMessage() // Remove this line in production
    ]);
}
?>