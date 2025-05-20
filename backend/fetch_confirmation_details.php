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

    // Check if confirmationID is provided
    if (!isset($_GET['confirmationID']) || empty($_GET['confirmationID'])) {
        throw new Exception("Confirmation ID is required");
    }

    $confirmationID = $_GET['confirmationID'];
    
    // Start transaction
    $conn->begin_transaction();

    try {
        // 1. Fetch confirmation application data
        $sql = "SELECT * FROM confirmation_application WHERE confirmationID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $confirmationID);
        $stmt->execute();
        $confirmationResult = $stmt->get_result();
        $confirmation = $confirmationResult->fetch_assoc();
        $stmt->close();
        
        if (!$confirmation) {
            throw new Exception("Confirmation record not found");
        }

        // 2. Fetch address information
        $sql = "SELECT * FROM confirmation_address WHERE confirmationID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $confirmationID);
        $stmt->execute();
        $addressResult = $stmt->get_result();
        $address = $addressResult->fetch_assoc();
        $stmt->close();

        // 3. Fetch father's information
        $sql = "SELECT * FROM confirmation_father WHERE confirmationID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $confirmationID);
        $stmt->execute();
        $fatherResult = $stmt->get_result();
        $father = $fatherResult->fetch_assoc();
        $stmt->close();

        // 4. Fetch mother's information
        $sql = "SELECT * FROM confirmation_mother WHERE confirmationID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $confirmationID);
        $stmt->execute();
        $motherResult = $stmt->get_result();
        $mother = $motherResult->fetch_assoc();
        $stmt->close();

        // 5. Fetch requirements
        $sql = "SELECT * FROM confirmation_requirement WHERE confirmationID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $confirmationID);
        $stmt->execute();
        $requirementsResult = $stmt->get_result();
        $requirements = $requirementsResult->fetch_assoc();
        $stmt->close();

        // Commit transaction
        $conn->commit();

        // Combine all data
        $confirmationData = [
            'confirmation' => $confirmation,
            'address' => $address,
            'father' => $father,
            'mother' => $mother,
            'requirements' => $requirements
        ];

        echo json_encode([
            "success" => true,
            "data" => $confirmationData
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