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
        // 1. Fetch marriage application data - UPDATED to include citizenship fields
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

        // 4. UPDATED: Fetch groom's parents with citizenship
        $sql = "SELECT * FROM marriage_groom_parents WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $groomParentsResult = $stmt->get_result();
        $groomParents = $groomParentsResult->fetch_assoc();
        $stmt->close();

        // 5. UPDATED: Fetch bride's parents with citizenship
        $sql = "SELECT * FROM marriage_bride_parents WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $brideParentsResult = $stmt->get_result();
        $brideParents = $brideParentsResult->fetch_assoc();
        $stmt->close();

        // 6. Fetch first witness
        $sql = "SELECT * FROM marriage_first_witness WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $firstWitnessResult = $stmt->get_result();
        $firstWitness = $firstWitnessResult->fetch_assoc();
        $stmt->close();

        // 7. Fetch second witness
        $sql = "SELECT * FROM marriage_second_witness WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $secondWitnessResult = $stmt->get_result();
        $secondWitness = $secondWitnessResult->fetch_assoc();
        $stmt->close();

        // 8. Fetch requirements
        $sql = "SELECT * FROM marriage_requirement WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $requirementsResult = $stmt->get_result();
        $requirements = $requirementsResult->fetch_assoc();
        $stmt->close();

        // Commit transaction
        $conn->commit();

        // Extract individual parent data from the combined tables - UPDATED with citizenship
        $groomFather = null;
        $groomMother = null;
        $brideFather = null;
        $brideMother = null;

        if ($groomParents) {
            $groomFather = [
                'first_name' => $groomParents['father_first_name'],
                'middle_name' => $groomParents['father_middle_name'],
                'last_name' => $groomParents['father_last_name'],
                'dateOfBirth' => $groomParents['father_dateOfBirth'],
                'age' => $groomParents['father_age'],
                'contact_number' => $groomParents['father_contact_number'],
                'citizenship' => $groomParents['father_citizenship'] ?? null // NEW FIELD
            ];
            
            $groomMother = [
                'first_name' => $groomParents['mother_first_name'],
                'middle_name' => $groomParents['mother_middle_name'],
                'last_name' => $groomParents['mother_last_name'],
                'dateOfBirth' => $groomParents['mother_dateOfBirth'],
                'age' => $groomParents['mother_age'],
                'contact_number' => $groomParents['mother_contact_number'],
                'citizenship' => $groomParents['mother_citizenship'] ?? null // NEW FIELD
            ];
        }

        if ($brideParents) {
            $brideFather = [
                'first_name' => $brideParents['father_first_name'],
                'middle_name' => $brideParents['father_middle_name'],
                'last_name' => $brideParents['father_last_name'],
                'dateOfBirth' => $brideParents['father_dateOfBirth'],
                'age' => $brideParents['father_age'],
                'contact_number' => $brideParents['father_contact_number'],
                'citizenship' => $brideParents['father_citizenship'] ?? null // NEW FIELD
            ];
            
            $brideMother = [
                'first_name' => $brideParents['mother_first_name'],
                'middle_name' => $brideParents['mother_middle_name'],
                'last_name' => $brideParents['mother_last_name'],
                'dateOfBirth' => $brideParents['mother_dateOfBirth'],
                'age' => $brideParents['mother_age'],
                'contact_number' => $brideParents['mother_contact_number'],
                'citizenship' => $brideParents['mother_citizenship'] ?? null // NEW FIELD
            ];
        }

        // Combine all data - marriage array already contains groom_citizenship and bride_citizenship from database
        $marriageData = [
            'marriage' => $marriage, // This already includes groom_citizenship and bride_citizenship from marriage_application table
            'groomAddress' => $groomAddress,
            'brideAddress' => $brideAddress,
            'groomFather' => $groomFather, // Now includes citizenship
            'groomMother' => $groomMother, // Now includes citizenship
            'brideFather' => $brideFather, // Now includes citizenship
            'brideMother' => $brideMother, // Now includes citizenship
            'firstWitness' => $firstWitness,
            'secondWitness' => $secondWitness,
            'requirements' => $requirements
        ];

        echo json_encode([
            "success" => true,
            "data" => $marriageData,
            "message" => "Marriage details fetched successfully with citizenship information"
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