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
    if (!$data || !isset($data->email, $data->password)) {
        throw new Exception("Email and password are required.");
    }

    // Sanitize input data
    $email = $conn->real_escape_string($data->email);
    $password = $data->password; // Don't escape the password

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

    // Check if the user exists in user_management table
    $stmt = $conn->prepare("SELECT userID, firstName, lastName, email, password, position, membershipStatus FROM user_management WHERE email = ?");
    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->bind_param("s", $email);
    if (!$stmt->execute()) {
        throw new Exception("Database execute error: " . $stmt->error);
    }

    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode([
            "success" => false, 
            "message" => "Invalid email or password.",
            "error" => "invalid_credentials"
        ]);
        $stmt->close();
        $conn->close();
        exit();
    }

    $user = $result->fetch_assoc();

    // Verify password
    if (password_verify($password, $user['password'])) {
        // Password is correct, create session
        $_SESSION['userID'] = $user['userID'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['firstName'] = $user['firstName'];
        $_SESSION['lastName'] = $user['lastName'];
        $_SESSION['position'] = $user['position'];
        $_SESSION['membershipStatus'] = $user['membershipStatus'];
        
        http_response_code(200);
        echo json_encode([
            "success" => true, 
            "message" => "Login successful.",
            "user" => [
                "userID" => $user['userID'],
                "firstName" => $user['firstName'],
                "lastName" => $user['lastName'],
                "email" => $user['email'],
                "position" => $user['position'],
                "membershipStatus" => $user['membershipStatus']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            "success" => false, 
            "message" => "Invalid email or password.",
            "error" => "invalid_credentials"
        ]);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    error_log("Ministry login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred during login. Please try again later.",
        "debug" => $e->getMessage() // Remove this line in production
    ]);
}
?> 