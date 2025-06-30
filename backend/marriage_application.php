<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

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
    die(json_encode(["success" => false, "message" => "DB connection failed"]));
}

try {
    $conn->begin_transaction();

    // Extract clientID - if it exists use it, otherwise set to null
    $clientID = $_POST['clientID'] ?? null;
    
    error_log("ClientID: " . ($clientID ?? 'NULL'));

    $applicationData = json_decode($_POST['applicationData'], true);
    $groomAddressData = json_decode($_POST['groomAddressData'], true);
    $brideAddressData = json_decode($_POST['brideAddressData'], true);
    $firstWitnessData = json_decode($_POST['firstWitnessData'], true);
    $secondWitnessData = json_decode($_POST['secondWitnessData'], true);

    // Insert into marriage_application
    $stmt = $conn->prepare("INSERT INTO marriage_application (
        clientID, date, time,
        groom_first_name, groom_middle_name, groom_last_name, groom_age, 
        groom_dateOfBirth, groom_dateOfBaptism, groom_churchOfBaptism, groom_placeOfBirth,
        bride_first_name, bride_middle_name, bride_last_name, bride_age,
        bride_dateOfBirth, bride_dateOfBaptism, bride_churchOfBaptism, bride_placeOfBirth
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param("issssssssssssssssss", 
        $clientID,  // This can now be null
        $applicationData['date'], 
        $applicationData['time'], 
        $applicationData['groom_first_name'],
        $applicationData['groom_middle_name'],
        $applicationData['groom_last_name'],
        $applicationData['groom_age'],
        $applicationData['groom_dateOfBirth'],
        $applicationData['groom_dateOfBaptism'],
        $applicationData['groom_churchOfBaptism'],
        $applicationData['groom_placeOfBirth'],
        $applicationData['bride_first_name'],
        $applicationData['bride_middle_name'],
        $applicationData['bride_last_name'],
        $applicationData['bride_age'],
        $applicationData['bride_dateOfBirth'],
        $applicationData['bride_dateOfBaptism'],
        $applicationData['bride_churchOfBaptism'],
        $applicationData['bride_placeOfBirth']
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Error inserting marriage application: " . $stmt->error);
    }
    
    $marriageID = $conn->insert_id;
    error_log("Created marriage application with ID: " . $marriageID);
    $stmt->close();

    // Insert groom's address
    $stmt = $conn->prepare("INSERT INTO marriage_groom_address (
        marriageID, street, barangay, municipality, province, region
    ) VALUES (?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param("isssss", 
        $marriageID,
        $groomAddressData['street'],
        $groomAddressData['barangay'],
        $groomAddressData['municipality'],
        $groomAddressData['province'],
        $groomAddressData['region']
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Error inserting groom address: " . $stmt->error);
    }
    $stmt->close();

    // Insert bride's address
    $stmt = $conn->prepare("INSERT INTO marriage_bride_address (
        marriageID, street, barangay, municipality, province, region
    ) VALUES (?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param("isssss", 
        $marriageID,
        $brideAddressData['street'],
        $brideAddressData['barangay'],
        $brideAddressData['municipality'],
        $brideAddressData['province'],
        $brideAddressData['region']
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Error inserting bride address: " . $stmt->error);
    }
    $stmt->close();

    // Insert first witness
    $stmt = $conn->prepare("INSERT INTO marriage_first_witness (
        marriageID, first_name, middle_name, last_name, gender, age,
        dateOfBirth, contact_number, street, barangay, municipality, province, region
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param("issssisssssss", 
        $marriageID,
        $firstWitnessData['first_name'],
        $firstWitnessData['middle_name'],
        $firstWitnessData['last_name'],
        $firstWitnessData['gender'],
        $firstWitnessData['age'],
        $firstWitnessData['dateOfBirth'],
        $firstWitnessData['contact_number'],
        $firstWitnessData['street'],
        $firstWitnessData['barangay'],
        $firstWitnessData['municipality'],
        $firstWitnessData['province'],
        $firstWitnessData['region']
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Error inserting first witness: " . $stmt->error);
    }
    $stmt->close();

    // Insert second witness
    $stmt = $conn->prepare("INSERT INTO marriage_second_witness (
        marriageID, first_name, middle_name, last_name, gender, age,
        dateOfBirth, contact_number, street, barangay, municipality, province, region
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param("issssisssssss", 
        $marriageID,
        $secondWitnessData['first_name'],
        $secondWitnessData['middle_name'],
        $secondWitnessData['last_name'],
        $secondWitnessData['gender'],
        $secondWitnessData['age'],
        $secondWitnessData['dateOfBirth'],
        $secondWitnessData['contact_number'],
        $secondWitnessData['street'],
        $secondWitnessData['barangay'],
        $secondWitnessData['municipality'],
        $secondWitnessData['province'],
        $secondWitnessData['region']
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Error inserting second witness: " . $stmt->error);
    }
    $stmt->close();

    // Handle requirements
    $uploadDir = "../uploads/marriage_requirements/";
    if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);

    // Define all requirements
    $requirements = [
        'baptism_cert', 'confirmation_cert', 'birth_cert', 
        'marriage_license', 'cenomar', 'publication_banns',
        'parish_permit', 'pre_cana', 'sponsors_list', 
        'canonical_interview'
    ];

    // Prepare columns and values for all requirements
    $columns = ["marriageID"];
    $values = ["?"];
    $types = "i"; // for marriageID
    $params = [$marriageID];

    // Process each requirement
    foreach ($requirements as $requirement) {
        // Handle file upload if present
        $filePath = "";
        if (isset($_FILES[$requirement]) && $_FILES[$requirement]['size'] > 0) {
            $filePath = time() . "_" . basename($_FILES[$requirement]['name']);
            move_uploaded_file($_FILES[$requirement]['tmp_name'], $uploadDir . $filePath);
        }
        
        // Add file path column
        $columns[] = $requirement;
        $values[] = "?";
        $types .= "s";
        $params[] = $filePath;
        
        // Add status column
        $columns[] = $requirement . "_status";
        $values[] = "?";
        $types .= "s";
        $status = isset($_POST[$requirement . '_status']) ? $_POST[$requirement . '_status'] : 'Not Submitted';
        $params[] = $status;
    }

    // Build and execute the query
    $sql = "INSERT INTO marriage_requirement (" . implode(", ", $columns) . ") VALUES (" . implode(", ", $values) . ")";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Database prepare error: " . $conn->error);
    }
    
    // Create a dynamic bind_param call
    $bindParams = array($types);
    foreach ($params as $key => $value) {
        $bindParams[] = &$params[$key];
    }
    
    call_user_func_array(array($stmt, 'bind_param'), $bindParams);
    
    if (!$stmt->execute()) {
        throw new Exception("Error inserting requirements: " . $stmt->error);
    }
    $stmt->close();

    $conn->commit();
    $response = [
        "success" => true, 
        "message" => "Marriage application submitted successfully",
        "marriageID" => $marriageID
    ];
    
} catch (Exception $e) {
    $conn->rollback();
    error_log("Error: " . $e->getMessage());
    $response = ["success" => false, "message" => $e->getMessage()];
}

$conn->close();
echo json_encode($response);
?>