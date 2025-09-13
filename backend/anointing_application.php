<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

$servername = "localhost";
$username = "u572625467_divine_mercy";
$password = "Parish_12345";
$dbname = "u572625467_parish";
$conn = new mysqli($servername, $username, $password, $dbname);

$response = ["success" => false, "message" => "Unknown error"];

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed: " . $conn->connect_error]);
    exit();
}

try {
    $conn->begin_transaction();

    // Debug: Log all received data
    error_log("=== PHP DEBUG START ===");
    error_log("POST data: " . print_r($_POST, true));
    error_log("FILES data: " . print_r($_FILES, true));

    // Extract and validate clientID
    $clientID = null;
    if (isset($_POST['clientID']) && !empty($_POST['clientID'])) {
        $clientID = intval($_POST['clientID']);
        if ($clientID <= 0) {
            throw new Exception("Invalid client ID");
        }
    }
    
    error_log("ClientID processed: " . var_export($clientID, true));
    
    // Get the JSON data from the anointingData field
    if (!isset($_POST['anointingData'])) {
        throw new Exception("No anointing data provided");
    }
    
    $anointingData = json_decode($_POST['anointingData'], true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON data: " . json_last_error_msg());
    }
    
    error_log("Decoded anointing data: " . print_r($anointingData, true));
    
    // Extract and validate required fields
    $requiredFields = ['dateOfAnointing', 'timeOfAnointing', 'firstName', 'lastName'];
    foreach ($requiredFields as $field) {
        if (!isset($anointingData[$field]) || empty($anointingData[$field])) {
            throw new Exception("Required field missing: " . $field);
        }
    }
    
    // Extract all fields with proper defaults
    $dateOfAnointing = $anointingData['dateOfAnointing'];
    $timeOfAnointing = $anointingData['timeOfAnointing'];
    $priestName = isset($anointingData['priestName']) ? $anointingData['priestName'] : '';
    
    $firstName = $anointingData['firstName'];
    $middleName = isset($anointingData['middleName']) && !empty($anointingData['middleName']) ? $anointingData['middleName'] : null;
    $lastName = $anointingData['lastName'];
    $sex = isset($anointingData['sex']) ? $anointingData['sex'] : '';
    
    // Convert age to integer
    $age = 0;
    if (isset($anointingData['age']) && !empty($anointingData['age'])) {
        $age = intval($anointingData['age']);
    }
    
    $dateOfBirth = isset($anointingData['dateOfBirth']) && !empty($anointingData['dateOfBirth']) ? $anointingData['dateOfBirth'] : null;
    $placeOfBirth = isset($anointingData['placeOfBirth']) && !empty($anointingData['placeOfBirth']) ? $anointingData['placeOfBirth'] : null;
    $religion = isset($anointingData['religion']) && !empty($anointingData['religion']) ? $anointingData['religion'] : null;
    $reasonForAnointing = isset($anointingData['reasonForAnointing']) ? $anointingData['reasonForAnointing'] : '';
    
    // Marital status information
    $maritalStatus = isset($anointingData['maritalStatus']) && !empty($anointingData['maritalStatus']) ? $anointingData['maritalStatus'] : null;
    $yearsMarried = null;
    if (isset($anointingData['yearsMarried']) && !empty($anointingData['yearsMarried'])) {
        $yearsMarried = intval($anointingData['yearsMarried']);
    }
    
    // Spouse information
    $spouseFirstName = isset($anointingData['spouseFirstName']) ? $anointingData['spouseFirstName'] : '';
    $spouseMiddleName = isset($anointingData['spouseMiddleName']) ? $anointingData['spouseMiddleName'] : '';
    $spouseLastName = isset($anointingData['spouseLastName']) ? $anointingData['spouseLastName'] : '';
    
    // Contact person details
    $contactFirstName = isset($anointingData['contactFirstName']) ? $anointingData['contactFirstName'] : '';
    $contactMiddleName = isset($anointingData['contactMiddleName']) ? $anointingData['contactMiddleName'] : '';
    $contactLastName = isset($anointingData['contactLastName']) ? $anointingData['contactLastName'] : '';
    $contactRelationship = isset($anointingData['contactRelationship']) ? $anointingData['contactRelationship'] : '';
    $contactPhone = isset($anointingData['contactPhone']) ? $anointingData['contactPhone'] : '';
    $contactEmail = isset($anointingData['contactEmail']) ? $anointingData['contactEmail'] : '';
    
    // Father information
    $fatherFirstName = isset($anointingData['fatherFirstName']) ? $anointingData['fatherFirstName'] : '';
    $fatherMiddleName = isset($anointingData['fatherMiddleName']) ? $anointingData['fatherMiddleName'] : '';
    $fatherLastName = isset($anointingData['fatherLastName']) ? $anointingData['fatherLastName'] : '';
    $fatherPhone = isset($anointingData['fatherPhone']) ? $anointingData['fatherPhone'] : '';
    $fatherEmail = isset($anointingData['fatherEmail']) ? $anointingData['fatherEmail'] : '';
    
    // Mother information
    $motherFirstName = isset($anointingData['motherFirstName']) ? $anointingData['motherFirstName'] : '';
    $motherMiddleName = isset($anointingData['motherMiddleName']) ? $anointingData['motherMiddleName'] : '';
    $motherLastName = isset($anointingData['motherLastName']) ? $anointingData['motherLastName'] : '';
    $motherPhone = isset($anointingData['motherPhone']) ? $anointingData['motherPhone'] : '';
    $motherEmail = isset($anointingData['motherEmail']) ? $anointingData['motherEmail'] : '';
    
    // Location details
    $locationType = isset($anointingData['locationType']) ? $anointingData['locationType'] : 'Hospital';
    $locationName = isset($anointingData['locationName']) ? $anointingData['locationName'] : '';
    $roomNumber = isset($anointingData['roomNumber']) ? $anointingData['roomNumber'] : '';
    $barangay = isset($anointingData['barangay']) ? $anointingData['barangay'] : '';
    $street = isset($anointingData['street']) ? $anointingData['street'] : '';
    $municipality = isset($anointingData['municipality']) ? $anointingData['municipality'] : '';
    $province = isset($anointingData['province']) ? $anointingData['province'] : '';
    $locationRegion = isset($anointingData['locationRegion']) ? $anointingData['locationRegion'] : '';
    
    // Additional details
    $isCritical = isset($anointingData['isCritical']) && $anointingData['isCritical'] === true ? 1 : 0;
    $needsViaticum = isset($anointingData['needsViaticum']) && $anointingData['needsViaticum'] === true ? 1 : 0;
    $needsReconciliation = isset($anointingData['needsReconciliation']) && $anointingData['needsReconciliation'] === true ? 1 : 0;
    $additionalNotes = isset($anointingData['additionalNotes']) ? $anointingData['additionalNotes'] : '';

    // Debug logging for parameters
    error_log("=== PARAMETERS DEBUG ===");
    error_log("clientID: " . var_export($clientID, true) . " (type: " . gettype($clientID) . ")");
    error_log("age: " . var_export($age, true) . " (type: " . gettype($age) . ")");
    error_log("yearsMarried: " . var_export($yearsMarried, true) . " (type: " . gettype($yearsMarried) . ")");

    // Step 1: Insert into anointing_application (main table)
    // IMPORTANT: Match the exact field order in your database
    $sql = "INSERT INTO anointing_application (
        clientID, dateOfAnointing, timeOfAnointing, priestName,
        firstName, middleName, lastName, sex, age, 
        dateOfBirth, placeOfBirth, religion, reasonForAnointing,
        marital_status, years_married
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Prepare failed for anointing_application: " . $conn->error);
    }
    
    // Count parameters: 15 total
    // i=integer, s=string
    // clientID(i), dateOfAnointing(s), timeOfAnointing(s), priestName(s), 
    // firstName(s), middleName(s), lastName(s), sex(s), age(i), 
    // dateOfBirth(s), placeOfBirth(s), religion(s), reasonForAnointing(s), 
    // marital_status(s), years_married(i)
    $typeString = "isssssssissssssi"; // 15 characters
    error_log("Type string: " . $typeString . " (length: " . strlen($typeString) . ")");
    
    // Prepare parameters array for logging
    $params = [
        $clientID, $dateOfAnointing, $timeOfAnointing, $priestName,
        $firstName, $middleName, $lastName, $sex, $age,
        $dateOfBirth, $placeOfBirth, $religion, $reasonForAnointing,
        $maritalStatus, $yearsMarried
    ];
    error_log("Parameters count: " . count($params));
    error_log("Parameters: " . print_r($params, true));
    
    $stmt->bind_param($typeString, 
        $clientID, $dateOfAnointing, $timeOfAnointing, $priestName,
        $firstName, $middleName, $lastName, $sex, $age,
        $dateOfBirth, $placeOfBirth, $religion, $reasonForAnointing,
        $maritalStatus, $yearsMarried
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed for anointing_application: " . $stmt->error);
    }
    
    $anointingID = $conn->insert_id;
    error_log("Anointing application inserted with ID: " . $anointingID);

    // Step 2: Insert into anointing_contactinfo (only if we have contact data)
    if (!empty($contactFirstName) || !empty($contactLastName) || !empty($contactPhone)) {
        $stmt = $conn->prepare("INSERT INTO anointing_contactinfo (
            anointingID, contactFirstName, contactMiddleName, contactLastName, 
            contactRelationship, contactPhone, contactEmail
        ) VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        if (!$stmt) {
            throw new Exception("Prepare failed for anointing_contactinfo: " . $conn->error);
        }
        
        $stmt->bind_param("issssss", 
            $anointingID, $contactFirstName, $contactMiddleName, $contactLastName,
            $contactRelationship, $contactPhone, $contactEmail
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed for anointing_contactinfo: " . $stmt->error);
        }
        
        error_log("Contact info inserted successfully");
    }

    // Step 3: Insert into anointing_father (only if we have father data)
    if (!empty($fatherFirstName) || !empty($fatherLastName)) {
        $stmt = $conn->prepare("INSERT INTO anointing_father (
            anointingID, father_firstName, father_middleName, father_lastName,
            father_phone, father_email
        ) VALUES (?, ?, ?, ?, ?, ?)");
        
        if (!$stmt) {
            throw new Exception("Prepare failed for anointing_father: " . $conn->error);
        }
        
        $stmt->bind_param("isssss", 
            $anointingID, $fatherFirstName, $fatherMiddleName, $fatherLastName,
            $fatherPhone, $fatherEmail
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed for anointing_father: " . $stmt->error);
        }
        
        error_log("Father info inserted successfully");
    }

    // Step 4: Insert into anointing_mother (only if we have mother data)
    if (!empty($motherFirstName) || !empty($motherLastName)) {
        $stmt = $conn->prepare("INSERT INTO anointing_mother (
            anointingID, mother_firstName, mother_middleName, mother_lastName,
            mother_phone, mother_email
        ) VALUES (?, ?, ?, ?, ?, ?)");
        
        if (!$stmt) {
            throw new Exception("Prepare failed for anointing_mother: " . $conn->error);
        }
        
        $stmt->bind_param("isssss", 
            $anointingID, $motherFirstName, $motherMiddleName, $motherLastName,
            $motherPhone, $motherEmail
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed for anointing_mother: " . $stmt->error);
        }
        
        error_log("Mother info inserted successfully");
    }

    // Step 5: Insert into anointing_spouse (only if we have spouse data)
    if (!empty($spouseFirstName) || !empty($spouseLastName)) {
        $stmt = $conn->prepare("INSERT INTO anointing_spouse (
            anointingID, spouse_firstName, spouse_middleName, spouse_lastName
        ) VALUES (?, ?, ?, ?)");
        
        if (!$stmt) {
            throw new Exception("Prepare failed for anointing_spouse: " . $conn->error);
        }
        
        $stmt->bind_param("isss", 
            $anointingID, $spouseFirstName, $spouseMiddleName, $spouseLastName
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed for anointing_spouse: " . $stmt->error);
        }
        
        error_log("Spouse info inserted successfully");
    }

    // Step 6: Insert into anointing_location
    $stmt = $conn->prepare("INSERT INTO anointing_location (
        anointingID, locationType, locationName, roomNumber, street,
        barangay, municipality, province, locationRegion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        throw new Exception("Prepare failed for anointing_location: " . $conn->error);
    }
    
    $stmt->bind_param("issssssss", 
        $anointingID, $locationType, $locationName, $roomNumber, $street,
        $barangay, $municipality, $province, $locationRegion
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed for anointing_location: " . $stmt->error);
    }
    
    error_log("Location info inserted successfully");

    // Step 7: Insert into anointing_additionalinfo
    $stmt = $conn->prepare("INSERT INTO anointing_additionalinfo (
        anointingID, isCritical, needsViaticum, needsReconciliation, additionalNotes
    ) VALUES (?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        throw new Exception("Prepare failed for anointing_additionalinfo: " . $conn->error);
    }
    
    $stmt->bind_param("iiiis", 
        $anointingID, $isCritical, $needsViaticum, $needsReconciliation, $additionalNotes
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed for anointing_additionalinfo: " . $stmt->error);
    }
    
    error_log("Additional info inserted successfully");

    // Step 8: Handle file uploads for requirements
    $uploadDir = "../uploads/anointing_requirements/";
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    // Insert requirements record
    $stmt = $conn->prepare("INSERT INTO anointing_requirement (
        anointingID, medical_cert, medical_cert_status, valid_ids, valid_ids_status
    ) VALUES (?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        throw new Exception("Prepare failed for anointing_requirement: " . $conn->error);
    }
    
    // Default values
    $medicalCertPath = "";
    $medicalCertStatus = "Not Submitted";
    $validIdsPath = "";
    $validIdsStatus = "Not Submitted";
    
    // Process medical certificate
    if (isset($_FILES['file_medical_cert']) && $_FILES['file_medical_cert']['error'] === UPLOAD_ERR_OK) {
        $medicalCertPath = time() . "_" . basename($_FILES['file_medical_cert']['name']);
        if (move_uploaded_file($_FILES['file_medical_cert']['tmp_name'], $uploadDir . $medicalCertPath)) {
            $medicalCertStatus = "Submitted";
            error_log("Medical certificate uploaded: " . $medicalCertPath);
        } else {
            error_log("Failed to upload medical certificate");
        }
    }
    
    // Process valid IDs
    if (isset($_FILES['file_valid_ids']) && $_FILES['file_valid_ids']['error'] === UPLOAD_ERR_OK) {
        $validIdsPath = time() . "_" . basename($_FILES['file_valid_ids']['name']);
        if (move_uploaded_file($_FILES['file_valid_ids']['tmp_name'], $uploadDir . $validIdsPath)) {
            $validIdsStatus = "Submitted";
            error_log("Valid IDs uploaded: " . $validIdsPath);
        } else {
            error_log("Failed to upload valid IDs");
        }
    }
    
    // Override with POST data if available
    if (isset($_POST['medical_cert_status'])) {
        $medicalCertStatus = $_POST['medical_cert_status'];
    }
    
    if (isset($_POST['valid_ids_status'])) {
        $validIdsStatus = $_POST['valid_ids_status'];
    }
    
    $stmt->bind_param("issss", 
        $anointingID, $medicalCertPath, $medicalCertStatus, $validIdsPath, $validIdsStatus
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed for anointing_requirement: " . $stmt->error);
    }
    
    error_log("Requirements inserted successfully");

    $conn->commit();
    error_log("=== TRANSACTION COMMITTED SUCCESSFULLY ===");
    error_log("Anointing ID: " . $anointingID);
    $response = ["success" => true, "message" => "Anointing application submitted successfully", "anointingID" => $anointingID];
    
} catch (Exception $e) {
    $conn->rollback();
    error_log("=== EXCEPTION OCCURRED ===");
    error_log("Exception: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    $response = ["success" => false, "message" => $e->getMessage()];
} catch (Error $e) {
    $conn->rollback();
    error_log("=== PHP ERROR OCCURRED ===");
    error_log("Error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    $response = ["success" => false, "message" => "PHP Error: " . $e->getMessage()];
}

$conn->close();
header('Content-Type: application/json');
echo json_encode($response);
error_log("=== RESPONSE SENT ===");
error_log("Response: " . json_encode($response));
?>