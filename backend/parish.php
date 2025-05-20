<?php
// Disable HTML error reporting and enable JSON error responses
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set JSON header at the very beginning
header("Content-Type: application/json; charset=UTF-8");

try {
    // CORS headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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

    // GET request - Fetch all parishes
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $sql = "SELECT * FROM parish ORDER BY parish_name ASC";
        $result = $conn->query($sql);

        if (!$result) {
            throw new Exception("Error fetching parishes: " . $conn->error);
        }

        $parishes = array();
        while ($row = $result->fetch_assoc()) {
            $parishes[] = array(
                'parishID' => $row['parishID'],
                'parish_name' => $row['parish_name']
            );
        }

        echo json_encode([
            "success" => true,
            "parishes" => $parishes
        ]);
    }
    // POST request - Add a new parish
    else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Read and decode JSON data from the request
        $json = file_get_contents("php://input");
        $data = json_decode($json);

        // Check if JSON parsing failed
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON: " . json_last_error_msg());
        }

        // Validate received data
        if (!$data || !isset($data->parish_name) || empty($data->parish_name)) {
            throw new Exception("Parish name is required.");
        }

        // Sanitize input data
        $parish_name = $conn->real_escape_string($data->parish_name);

        // Check if the parish already exists
        $stmt = $conn->prepare("SELECT * FROM parish WHERE parish_name = ?");
        if (!$stmt) {
            throw new Exception("Database prepare error: " . $conn->error);
        }

        $stmt->bind_param("s", $parish_name);
        if (!$stmt->execute()) {
            throw new Exception("Database execute error: " . $stmt->error);
        }

        $parishCheckResult = $stmt->get_result();

        if ($parishCheckResult->num_rows > 0) {
            http_response_code(409); // Conflict status code
            echo json_encode([
                "success" => false, 
                "message" => "A parish with this name already exists.",
                "error" => "parish_exists"
            ]);
            $stmt->close();
            $conn->close();
            exit();
        }
        $stmt->close();

        // Insert the new parish
        $stmt = $conn->prepare("INSERT INTO parish (parish_name) VALUES (?)");
        if (!$stmt) {
            throw new Exception("Database prepare error: " . $conn->error);
        }

        $stmt->bind_param("s", $parish_name);

        if ($stmt->execute()) {
            http_response_code(201); // Created status code
            echo json_encode([
                "success" => true, 
                "message" => "Parish added successfully.",
                "parishID" => $conn->insert_id,
                "parish_name" => $parish_name
            ]);
        } else {
            throw new Exception("Database error: " . $stmt->error);
        }

        $stmt->close();
    } else {
        http_response_code(405);
        echo json_encode([
            "success" => false,
            "message" => "Method not allowed"
        ]);
    }

    $conn->close();

} catch (Exception $e) {
    error_log("Parish API error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred. Please try again later.",
        "debug" => $e->getMessage() // Remove this line in production
    ]);
}
?>