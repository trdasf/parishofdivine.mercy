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
    if (!$data || !isset($data->email, $data->new_password)) {
        throw new Exception("Email and new password are required.");
    }

    // Sanitize input data
    $email = $conn->real_escape_string($data->email);
    $new_password = $data->new_password;

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "Invalid email format.",
            "error" => "invalid_email"
        ]);
        exit();
    }

    // Validate password requirements (minimum 8 characters, at least one uppercase, one number, one special character)
    if (strlen($new_password) < 8) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "Password must be at least 8 characters long.",
            "error" => "password_too_short"
        ]);
        exit();
    }

    // Check for uppercase letter
    if (!preg_match('/[A-Z]/', $new_password)) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "Password must contain at least one uppercase letter.",
            "error" => "password_no_uppercase"
        ]);
        exit();
    }

    // Check for number
    if (!preg_match('/[0-9]/', $new_password)) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "Password must contain at least one number.",
            "error" => "password_no_number"
        ]);
        exit();
    }

    // Check for special character
    if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $new_password)) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;':\",./<>?).",
            "error" => "password_no_special"
        ]);
        exit();
    }

    // Check if the email exists in the database
    $stmt = $conn->prepare("SELECT clientID, email FROM client_registration WHERE email = ?");
    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->bind_param("s", $email);
    if (!$stmt->execute()) {
        throw new Exception("Database execute error: " . $stmt->error);
    }

    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false, 
            "message" => "Email address not found. Please check your email and try again.",
            "error" => "email_not_found"
        ]);
        $stmt->close();
        $conn->close();
        exit();
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    // Hash the new password
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

    // Update the password in the database
    $update_stmt = $conn->prepare("UPDATE client_registration SET password = ? WHERE email = ?");
    if (!$update_stmt) {
        throw new Exception("Database prepare error for update: " . $conn->error);
    }

    $update_stmt->bind_param("ss", $hashed_password, $email);
    
    if (!$update_stmt->execute()) {
        throw new Exception("Database execute error for update: " . $update_stmt->error);
    }

    if ($update_stmt->affected_rows === 0) {
        throw new Exception("No rows were updated. Password reset failed.");
    }

    $update_stmt->close();
    $conn->close();

    // Success response
    http_response_code(200);
    echo json_encode([
        "success" => true, 
        "message" => "Password has been successfully reset. You can now login with your new password.",
        "clientID" => $user['clientID']
    ]);

} catch (Exception $e) {
    error_log("Client forgot password error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred while resetting your password. Please try again later.",
        "debug" => $e->getMessage() // Remove this line in production
    ]);
}
?>