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

    // Only accept POST requests for authentication
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode([
            "success" => false,
            "message" => "Method not allowed. Only POST requests are accepted.",
            "error" => "method_not_allowed"
        ]);
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
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON format.",
            "error" => "invalid_json"
        ]);
        exit();
    }

    // Validate required fields
    if (!$data || !isset($data->email, $data->password)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Email and password are required.",
            "error" => "missing_credentials"
        ]);
        exit();
    }

    // Sanitize input data
    $email = $conn->real_escape_string(trim($data->email));
    $inputPassword = $data->password;

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid email format.",
            "error" => "invalid_email_format"
        ]);
        exit();
    }

    // Prepare SQL statement to get user by email
    $stmt = $conn->prepare("SELECT userID, firstName, middleName, lastName, email, password, position, membershipStatus FROM user_management WHERE email = ?");
    
    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }

    $stmt->bind_param("s", $email);
    
    if (!$stmt->execute()) {
        throw new Exception("Database execute error: " . $stmt->error);
    }

    $result = $stmt->get_result();

    // Check if user exists
    if ($result->num_rows === 0) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password.",
            "error" => "invalid_credentials"
        ]);
        $stmt->close();
        exit();
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    // Verify password
    if (!password_verify($inputPassword, $user['password'])) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password.",
            "error" => "invalid_credentials"
        ]);
        exit();
    }

    // Check if user position is Parish
    if ($user['position'] !== 'Parish') {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Access denied. Only Parish organizers can access this system.",
            "error" => "access_denied"
        ]);
        exit();
    }

    // Check if account is active
    if ($user['membershipStatus'] !== 'active') {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Your account is inactive. Please contact an administrator.",
            "error" => "account_inactive"
        ]);
        exit();
    }

    // Authentication successful
    // Remove password from user data before sending response
    unset($user['password']);

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Login successful.",
        "user" => [
            "userID" => $user['userID'],
            "firstName" => $user['firstName'],
            "middleName" => $user['middleName'],
            "lastName" => $user['lastName'],
            "email" => $user['email'],
            "position" => $user['position'],
            "membershipStatus" => $user['membershipStatus']
        ]
    ]);

    $conn->close();

} catch (Exception $e) {
    error_log("Parish login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred during login. Please try again later.",
        "error" => "server_error",
        "debug" => $e->getMessage() // Remove this line in production
    ]);
}
?>