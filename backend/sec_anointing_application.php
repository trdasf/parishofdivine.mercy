<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

// Enable error reporting for debugging
// error_reporting(E_ALL);
// ini_set('display_errors', 0); // Don't display errors to browser
// ini_set('log_errors', 1);
// ini_set('error_log', 'error.log');

$servername = "localhost";
$username = "u572625467_divine_mercy";
$password = "Parish_12345";
$dbname = "u572625467_parish";
$conn = new mysqli($servername, $username, $password, $dbname);

$response = ["success" => false, "message" => "Unknown error"];

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit();
}

try {
    $conn->begin_transaction();

    // Get the JSON data from the anointingData field
    $anointingData = json_decode($_POST['anointingData'], true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON data: " . json_last_error_msg());
    }
    
    // Date/time details and sick person information
    $dateOfAnointing = $anointingData['dateOfAnointing'];
    $timeOfAnointing = $anointingData['timeOfAnointing'];
    $priestName = $anointingData['priestName'];
    
    $firstName = $anointingData['firstName'];
    $middleName = $anointingData['middleName'];
    $lastName = $anointingData['lastName'];
    $sex = $anointingData['sex'];
    $age = $anointingData['age'];
    $dateOfBirth = $anointingData['dateOfBirth']; 
    $placeOfBirth = $anointingData['placeOfBirth'];
    $religion = $anointingData['religion'];
    $reasonForAnointing = $anointingData['reasonForAnointing'];
    
    // Contact person details
    $contactFirstName = $anointingData['contactFirstName'];
    $contactMiddleName = $anointingData['contactMiddleName'];
    $contactLastName = $anointingData['contactLastName'];
    $contactRelationship = $anointingData['contactRelationship'];
    $contactPhone = $anointingData['contactPhone'];
    $contactEmail = $anointingData['contactEmail'];
    
    // Location details
    $locationType = $anointingData['locationType'];
    $locationName = $anointingData['locationName'];
    $roomNumber = $anointingData['roomNumber'];
    $barangay = $anointingData['barangay'];
    $street = $anointingData['street'];
    $municipality = $anointingData['municipality'];
    $province = $anointingData['province'];
    $locationRegion = $anointingData['locationRegion'];
    
    // Additional details
    $isCritical = isset($anointingData['isCritical']) && $anointingData['isCritical'] === true ? 1 : 0;
    $needsViaticum = isset($anointingData['needsViaticum']) && $anointingData['needsViaticum'] === true ? 1 : 0;
    $needsReconciliation = isset($anointingData['needsReconciliation']) && $anointingData['needsReconciliation'] === true ? 1 : 0;
    $additionalNotes = $anointingData['additionalNotes'];

    // Step 1: Insert into anointing_application (main table) - removed clientID
    $stmt = $conn->prepare("INSERT INTO anointing_application (
        dateOfAnointing, timeOfAnointing, priestName,
        firstName, middleName, lastName, sex, age, 
        dateOfBirth, placeOfBirth, religion, reasonForAnointing
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param("sssssssissss", 
        $dateOfAnointing,
        $timeOfAnointing,
        $priestName,
        $firstName,
        $middleName,
        $lastName,
        $sex,
        $age,
        $dateOfBirth,
        $placeOfBirth,
        $religion,
        $reasonForAnointing
    );
    
    $stmt->execute();
    $anointingID = $conn->insert_id;

    // Step 2: Insert into anointing_contactinfo
    $stmt = $conn->prepare("INSERT INTO anointing_contactinfo (
        anointingID, contactFirstName, contactMiddleName, contactLastName, 
        contactRelationship, contactPhone, contactEmail
    ) VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param("issssss", 
        $anointingID,
        $contactFirstName,
        $contactMiddleName,
        $contactLastName,
        $contactRelationship,
        $contactPhone,
        $contactEmail
    );
    
    $stmt->execute();

    // Step 3: Insert into anointing_location
    $stmt = $conn->prepare("INSERT INTO anointing_location (
        anointingID, locationType, locationName, roomNumber, street,
        barangay, municipality, province, locationRegion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param("issssssss", 
        $anointingID,
        $locationType,
        $locationName,
        $roomNumber,
        $street,
        $barangay,
        $municipality,
        $province,
        $locationRegion
    );
    
    $stmt->execute();

    // Step 4: Insert into anointing_additionalinfo
    $stmt = $conn->prepare("INSERT INTO anointing_additionalinfo (
        anointingID, isCritical, needsViaticum, needsReconciliation, additionalNotes
    ) VALUES (?, ?, ?, ?, ?)");
    
    $stmt->bind_param("iiiis", 
        $anointingID,
        $isCritical,
        $needsViaticum,
        $needsReconciliation,
        $additionalNotes
    );
    
    $stmt->execute();

    // Step 5: Handle file uploads for requirements
    $uploadDir = "../uploads/anointing_requirements/";
    if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);
    
    // Define required files
    $requirements = [
        'medical_cert',
        'valid_ids'
    ];
    
    // Insert requirements record
    $stmt = $conn->prepare("INSERT INTO anointing_requirement (
        anointingID, medical_cert, medical_cert_status, valid_ids, valid_ids_status
    ) VALUES (?, ?, ?, ?, ?)");
    
    // Default values
    $medicalCertPath = "";
    $medicalCertStatus = "Not Submitted";
    $validIdsPath = "";
    $validIdsStatus = "Not Submitted";
    
    // Process medical certificate
    if (isset($_FILES['file_medical_cert']) && $_FILES['file_medical_cert']['size'] > 0) {
        $medicalCertPath = time() . "_" . basename($_FILES['file_medical_cert']['name']);
        move_uploaded_file($_FILES['file_medical_cert']['tmp_name'], $uploadDir . $medicalCertPath);
        $medicalCertStatus = "Submitted";
    }
    
    // Process valid IDs
    if (isset($_FILES['file_valid_ids']) && $_FILES['file_valid_ids']['size'] > 0) {
        $validIdsPath = time() . "_" . basename($_FILES['file_valid_ids']['name']);
        move_uploaded_file($_FILES['file_valid_ids']['tmp_name'], $uploadDir . $validIdsPath);
        $validIdsStatus = "Submitted";
    }
    
    // Set status from POST data if available
    if (isset($_POST['medical_cert_status'])) {
        $medicalCertStatus = $_POST['medical_cert_status'];
    }
    
    if (isset($_POST['valid_ids_status'])) {
        $validIdsStatus = $_POST['valid_ids_status'];
    }
    
    $stmt->bind_param("issss", 
        $anointingID,
        $medicalCertPath,
        $medicalCertStatus,
        $validIdsPath,
        $validIdsStatus
    );
    
    $stmt->execute();

    $conn->commit();
    $response = ["success" => true, "message" => "Anointing application submitted successfully", "anointingID" => $anointingID];
} catch (Exception $e) {
    $conn->rollback();
    $response = ["success" => false, "message" => $e->getMessage()];
} catch (Error $e) {
    $conn->rollback();
    $response = ["success" => false, "message" => "Error: " . $e->getMessage()];
}

$conn->close();
echo json_encode($response);