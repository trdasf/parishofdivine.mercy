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

    // Check if baptismID is provided
    if (!isset($_GET['baptismID']) || empty($_GET['baptismID'])) {
        throw new Exception("Baptism ID is required");
    }

    $baptismID = $_GET['baptismID'];
    
    // Start transaction
    $conn->begin_transaction();

    try {
        // 1. Fetch baptism application data
        $sql = "SELECT * FROM baptism_application WHERE baptismID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $baptismID);
        $stmt->execute();
        $baptismResult = $stmt->get_result();
        $baptism = $baptismResult->fetch_assoc();
        $stmt->close();
        
        if (!$baptism) {
            throw new Exception("Baptism record not found");
        }

        // 2. Fetch parents information
        $sql = "SELECT * FROM baptism_parents WHERE baptismID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $baptismID);
        $stmt->execute();
        $parentsResult = $stmt->get_result();
        $parents = $parentsResult->fetch_assoc();
        $stmt->close();

        // 3. Fetch marital status
        $sql = "SELECT pm.* FROM parent_maritalstatus pm 
                JOIN baptism_parents bp ON pm.bparentsID = bp.bparentsID 
                WHERE bp.baptismID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $baptismID);
        $stmt->execute();
        $maritalResult = $stmt->get_result();
        $marital = $maritalResult->fetch_assoc();
        $stmt->close();

        // 4. Fetch address
        $sql = "SELECT * FROM baptism_address WHERE baptismID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $baptismID);
        $stmt->execute();
        $addressResult = $stmt->get_result();
        $address = $addressResult->fetch_assoc();
        $stmt->close();

        // 5. Fetch godparents
        $sql = "SELECT * FROM baptism_godparents WHERE baptismID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $baptismID);
        $stmt->execute();
        $godparentsResult = $stmt->get_result();
        $godFathers = [];
        $godMothers = [];
        
        while ($godparent = $godparentsResult->fetch_assoc()) {
            if ($godparent['type'] == 'godfather') {
                $godFathers[] = $godparent['name'];
            } else {
                $godMothers[] = $godparent['name'];
            }
        }
        $stmt->close();

        // 6. Fetch requirements
        $sql = "SELECT * FROM baptism_requirement WHERE baptismID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $baptismID);
        $stmt->execute();
        $requirementsResult = $stmt->get_result();
        $requirements = $requirementsResult->fetch_assoc();
        $stmt->close();

        // Commit transaction
        $conn->commit();

        // Combine all data
        $baptismData = [
            'baptism' => $baptism,
            'parents' => $parents,
            'marital' => $marital,
            'address' => $address,
            'godFathers' => $godFathers,
            'godMothers' => $godMothers,
            'requirements' => $requirements
        ];

        echo json_encode([
            "success" => true,
            "data" => $baptismData
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