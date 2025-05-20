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

    // Check if marriageID is provided
    if (!isset($_GET['marriageID']) || empty($_GET['marriageID'])) {
        throw new Exception("Marriage ID is required");
    }

    $marriageID = $_GET['marriageID'];
    
    // Start transaction
    $conn->begin_transaction();

    try {
        // 1. Fetch marriage application data
        $sql = "SELECT * FROM marriage_application WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $marriageResult = $stmt->get_result();
        $marriage = $marriageResult->fetch_assoc();
        $stmt->close();
        
        if (!$marriage) {
            throw new Exception("Marriage record not found");
        }

        // 2. Fetch groom's address
        $sql = "SELECT * FROM marriage_groom_address WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $groomAddressResult = $stmt->get_result();
        $groomAddress = $groomAddressResult->fetch_assoc();
        $stmt->close();

        // 3. Fetch bride's address
        $sql = "SELECT * FROM marriage_bride_address WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $brideAddressResult = $stmt->get_result();
        $brideAddress = $brideAddressResult->fetch_assoc();
        $stmt->close();

        // 4. Fetch first witness
        $sql = "SELECT * FROM marriage_first_witness WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $firstWitnessResult = $stmt->get_result();
        $firstWitness = $firstWitnessResult->fetch_assoc();
        $stmt->close();

        // 5. Fetch second witness
        $sql = "SELECT * FROM marriage_second_witness WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $secondWitnessResult = $stmt->get_result();
        $secondWitness = $secondWitnessResult->fetch_assoc();
        $stmt->close();

        // 6. Fetch requirements
        $sql = "SELECT * FROM marriage_requirement WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $requirementsResult = $stmt->get_result();
        $requirements = $requirementsResult->fetch_assoc();
        $stmt->close();

        // Commit transaction
        $conn->commit();

        // Combine all data
        $marriageData = [
            'marriage' => $marriage,
            'groomAddress' => $groomAddress,
            'brideAddress' => $brideAddress,
            'firstWitness' => $firstWitness,
            'secondWitness' => $secondWitness,
            'requirements' => $requirements
        ];

        echo json_encode([
            "success" => true,
            "data" => $marriageData
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