<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

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

    // Check if communionID is provided
    if (!isset($_GET['communionID']) || empty($_GET['communionID'])) {
        throw new Exception("Communion ID is required");
    }

    $communionID = $_GET['communionID'];
    
    // Start transaction
    $conn->begin_transaction();

    try {
        // 1. Fetch communion application data
        $sql = "SELECT * FROM communion_application WHERE communionID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $communionID);
        $stmt->execute();
        $communionResult = $stmt->get_result();
        $communion = $communionResult->fetch_assoc();
        $stmt->close();
        
        if (!$communion) {
            throw new Exception("Communion record not found");
        }

        // 2. Fetch address information
        $sql = "SELECT * FROM communion_address WHERE communionID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $communionID);
        $stmt->execute();
        $addressResult = $stmt->get_result();
        $address = $addressResult->fetch_assoc();
        $stmt->close();

        // 3. Fetch father's information
        $sql = "SELECT * FROM communion_father WHERE communionID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $communionID);
        $stmt->execute();
        $fatherResult = $stmt->get_result();
        $father = $fatherResult->fetch_assoc();
        $stmt->close();

        // 4. Fetch mother's information
        $sql = "SELECT * FROM communion_mother WHERE communionID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $communionID);
        $stmt->execute();
        $motherResult = $stmt->get_result();
        $mother = $motherResult->fetch_assoc();
        $stmt->close();

        // 5. Fetch requirements
        $sql = "SELECT * FROM communion_requirement WHERE communionID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $communionID);
        $stmt->execute();
        $requirementsResult = $stmt->get_result();
        $requirements = $requirementsResult->fetch_assoc();
        $stmt->close();

        // Commit transaction
        $conn->commit();

        // Combine all data
        $communionData = [
            'communion' => $communion,
            'address' => $address,
            'father' => $father,
            'mother' => $mother,
            'requirements' => $requirements
        ];

        echo json_encode([
            "success" => true,
            "data" => $communionData
        ]);

    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        throw $e;
    }

    $conn->close();

} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>