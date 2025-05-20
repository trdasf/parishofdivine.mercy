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
    if (!$data || !isset($data->first_name, $data->last_name, $data->contact_number, $data->email, $data->password)) {
        throw new Exception("Incomplete data provided. Please fill in all required fields.");
    }

    // Sanitize input data
    $first_name = $conn->real_escape_string($data->first_name);
    $last_name = $conn->real_escape_string($data->last_name);
    $contact_number = $conn->real_escape_string($data->contact_number);
    $email = $conn->real_escape_string($data->email);

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "Invalid email format. Please use a valid email address.",
            "error" => "invalid_email"
        ]);
        exit();
    }

    // Validate contact number (basic validation)
    if (!preg_match('/^[0-9+\-\s()]+$/', $contact_number)) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "Invalid contact number format.",
            "error" => "invalid_contact"
        ]);
        exit();
    }

    // Hash the password securely
    $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);

    // Check if the email is already registered
    $stmt = $conn->prepare("SELECT * FROM client_registration WHERE email = ?");
    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->bind_param("s", $email);
    if (!$stmt->execute()) {
        throw new Exception("Database execute error: " . $stmt->error);
    }

    $emailCheckResult = $stmt->get_result();

    if ($emailCheckResult->num_rows > 0) {
        http_response_code(409); // Conflict status code
        echo json_encode([
            "success" => false, 
            "message" => "An account with this email already exists.",
            "error" => "email_exists"
        ]);
        $stmt->close();
        $conn->close();
        exit();
    }
    $stmt->close();

    // Insert the new client account
    $stmt = $conn->prepare("INSERT INTO client_registration (first_name, last_name, contact_number, email, password) VALUES (?, ?, ?, ?, ?)");
    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->bind_param("sssss", $first_name, $last_name, $contact_number, $email, $hashed_password);

    if ($stmt->execute()) {
        http_response_code(201); // Created status code
        echo json_encode([
            "success" => true, 
            "message" => "Registration successful.",
            "clientID" => $conn->insert_id
        ]);
    } else {
        throw new Exception("Database error: " . $stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    error_log("Client registration error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred during registration. Please try again later.",
        "debug" => $e->getMessage() // Remove this line in production
    ]);
}
?>