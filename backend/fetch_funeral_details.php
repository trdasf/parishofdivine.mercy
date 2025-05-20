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

    // Check if funeralID is provided
    if (!isset($_GET['funeralID']) || empty($_GET['funeralID'])) {
        throw new Exception("Funeral ID is required");
    }

    $funeralID = $_GET['funeralID'];
    
    // Start transaction
    $conn->begin_transaction();

    try {
        // 1. Fetch funeral application data
        $sql = "SELECT * FROM funeral_mass_application WHERE funeralID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $funeralID);
        $stmt->execute();
        $funeralResult = $stmt->get_result();
        $funeral = $funeralResult->fetch_assoc();
        $stmt->close();
        
        if (!$funeral) {
            throw new Exception("Funeral record not found");
        }

        // 2. Fetch deceased information using funeralID
        $sql = "SELECT * FROM deceased_info WHERE funeralID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $funeralID);
        $stmt->execute();
        $deceasedResult = $stmt->get_result();
        $deceased = $deceasedResult->fetch_assoc();
        $stmt->close();

        // 3. Fetch requester information using funeralID
        $sql = "SELECT * FROM requester_info WHERE funeralID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $funeralID);
        $stmt->execute();
        $requesterResult = $stmt->get_result();
        $requester = $requesterResult->fetch_assoc();
        $stmt->close();

        // 4. Fetch address information using funeralID
        $sql = "SELECT * FROM deceased_address WHERE funeralID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $funeralID);
        $stmt->execute();
        $addressResult = $stmt->get_result();
        $address = $addressResult->fetch_assoc();
        $stmt->close();

        // 5. Fetch requirements using funeralID
        $sql = "SELECT * FROM burial_requirements WHERE funeralID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $funeralID);
        $stmt->execute();
        $requirementsResult = $stmt->get_result();
        $requirements = $requirementsResult->fetch_assoc();
        $stmt->close();

        // Commit transaction
        $conn->commit();

        // Combine all data
        $funeralData = [
            'funeral' => $funeral,
            'deceased' => $deceased,
            'requester' => $requester,
            'address' => $address,
            'requirements' => $requirements
        ];

        echo json_encode([
            "success" => true,
            "data" => $funeralData
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