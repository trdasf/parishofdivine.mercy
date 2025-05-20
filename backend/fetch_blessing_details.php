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

    // Check if blessingID is provided
    if (!isset($_GET['blessingID']) || empty($_GET['blessingID'])) {
        throw new Exception("Blessing ID is required");
    }

    $blessingID = $_GET['blessingID'];
    
    // Start transaction
    $conn->begin_transaction();

    try {
        // 1. Fetch blessing application data
        $sql = "SELECT * FROM blessing_application WHERE blessingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $blessingID);
        $stmt->execute();
        $blessingResult = $stmt->get_result();
        $blessing = $blessingResult->fetch_assoc();
        $stmt->close();
        
        if (!$blessing) {
            throw new Exception("Blessing record not found");
        }

        // 2. Fetch address information
        $sql = "SELECT * FROM blessing_address WHERE blessingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $blessingID);
        $stmt->execute();
        $addressResult = $stmt->get_result();
        $address = $addressResult->fetch_assoc();
        $stmt->close();

        // 3. Fetch blessing type information
        $sql = "SELECT * FROM blessing_type WHERE blessingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $blessingID);
        $stmt->execute();
        $typeResult = $stmt->get_result();
        $type = $typeResult->fetch_assoc();
        $stmt->close();

        // 4. Fetch requirements
        $sql = "SELECT * FROM blessing_requirements WHERE blessingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $blessingID);
        $stmt->execute();
        $requirementsResult = $stmt->get_result();
        $requirements = [];
        
        while ($row = $requirementsResult->fetch_assoc()) {
            $requirements[] = $row;
        }
        
        $stmt->close();

        // Commit transaction
        $conn->commit();

        // Combine all data
        $blessingData = [
            'blessing' => $blessing,
            'address' => $address,
            'type' => $type,
            'requirements' => $requirements
        ];

        echo json_encode([
            "success" => true,
            "data" => $blessingData
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