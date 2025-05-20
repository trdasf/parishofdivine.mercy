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

    // Check if anointingID is provided
    if (!isset($_GET['anointingID']) || empty($_GET['anointingID'])) {
        throw new Exception("Anointing ID is required");
    }

    $anointingID = $_GET['anointingID'];
    
    // Start transaction
    $conn->begin_transaction();

    try {
        // 1. Fetch anointing application data
        $sql = "SELECT * FROM anointing_application WHERE anointingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $anointingID);
        $stmt->execute();
        $anointingResult = $stmt->get_result();
        $anointing = $anointingResult->fetch_assoc();
        $stmt->close();
        
        if (!$anointing) {
            throw new Exception("Anointing record not found");
        }

        // 2. Fetch contact information
        $sql = "SELECT * FROM anointing_contactinfo WHERE anointingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $anointingID);
        $stmt->execute();
        $contactResult = $stmt->get_result();
        $contact = $contactResult->fetch_assoc();
        $stmt->close();

        // 3. Fetch location information
        $sql = "SELECT * FROM anointing_location WHERE anointingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $anointingID);
        $stmt->execute();
        $locationResult = $stmt->get_result();
        $location = $locationResult->fetch_assoc();
        $stmt->close();

        // 4. Fetch additional information
        $sql = "SELECT * FROM anointing_additionalinfo WHERE anointingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $anointingID);
        $stmt->execute();
        $additionalInfoResult = $stmt->get_result();
        $additionalInfo = $additionalInfoResult->fetch_assoc();
        $stmt->close();

        // 5. Fetch requirements
        $sql = "SELECT * FROM anointing_requirement WHERE anointingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $anointingID);
        $stmt->execute();
        $requirementsResult = $stmt->get_result();
        $requirements = $requirementsResult->fetch_assoc();
        $stmt->close();

        // Commit transaction
        $conn->commit();

        // Combine all data
        $anointingData = [
            'anointing' => $anointing,
            'contact' => $contact,
            'locationInfo' => $location,
            'additionalInfo' => $additionalInfo,
            'requirements' => $requirements
        ];

        echo json_encode([
            "success" => true,
            "data" => $anointingData
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