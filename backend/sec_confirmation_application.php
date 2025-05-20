<?php
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

    $applicationData = json_decode($_POST['applicationData'], true);
    $addressData = json_decode($_POST['addressData'], true);
    $fatherData = json_decode($_POST['fatherData'], true);
    $motherData = json_decode($_POST['motherData'], true);
    
    // Debug output of received data
    error_log("Received application data: " . $_POST['applicationData']);
    
    // Check for JSON decode errors
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON decode error: " . json_last_error_msg());
    }

    // Check if there's already a confirmation application with the same date, time and priest
    $checkStmt = $conn->prepare("SELECT confirmationID FROM confirmation_application WHERE date = ? AND time = ? AND priest = ? AND status != 'cancelled' AND status != 'completed'");
    $checkStmt->bind_param("sss", 
        $applicationData['date'],
        $applicationData['time'],
        $applicationData['priest']
    );
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        throw new Exception("There is already a confirmation scheduled for this date, time, and priest. Please select a different schedule.");
    }
    $checkStmt->close();

    // Format dates properly to ensure yyyy-mm-dd format
    $dateOfBirth = !empty($applicationData['dateOfBirth']) ? $applicationData['dateOfBirth'] : null;
    $dateOfBaptism = !empty($applicationData['dateOfBaptism']) ? $applicationData['dateOfBaptism'] : null;
    
    // Validate date format and convert if needed
    if ($dateOfBirth) {
        if (strtotime($dateOfBirth) === false) {
            error_log("Invalid date of birth format: " . $dateOfBirth);
            $dateOfBirth = null;
        } else {
            $dateOfBirth = date('Y-m-d', strtotime($dateOfBirth));
        }
    }
    
    if ($dateOfBaptism) {
        if (strtotime($dateOfBaptism) === false) {
            error_log("Invalid date of baptism format: " . $dateOfBaptism);
            $dateOfBaptism = null;
        } else {
            $dateOfBaptism = date('Y-m-d', strtotime($dateOfBaptism));
        }
    }
    
    // Debug output
    error_log("Date of Birth: " . $dateOfBirth);
    error_log("Date of Baptism: " . $dateOfBaptism);

    // Format dates for parent information too if needed
    if (isset($fatherData['dateOfBirth']) && !empty($fatherData['dateOfBirth'])) {
        if (strtotime($fatherData['dateOfBirth']) !== false) {
            $fatherData['dateOfBirth'] = date('Y-m-d', strtotime($fatherData['dateOfBirth']));
            error_log("Father's Date of Birth: " . $fatherData['dateOfBirth']);
        } else {
            error_log("Invalid father's date of birth format: " . $fatherData['dateOfBirth']);
            $fatherData['dateOfBirth'] = null;
        }
    }
    
    if (isset($motherData['dateOfBirth']) && !empty($motherData['dateOfBirth'])) {
        if (strtotime($motherData['dateOfBirth']) !== false) {
            $motherData['dateOfBirth'] = date('Y-m-d', strtotime($motherData['dateOfBirth']));
            error_log("Mother's Date of Birth: " . $motherData['dateOfBirth']);
        } else {
            error_log("Invalid mother's date of birth format: " . $motherData['dateOfBirth']);
            $motherData['dateOfBirth'] = null;
        }
    }

    // Insert into confirmation_application - removed clientID
    $stmt = $conn->prepare("INSERT INTO confirmation_application (date, time, priest, first_name, middle_name, last_name, gender, age, dateOfBirth, dateOfBaptism, churchOfBaptism, placeOfBirth, status) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')");
    $stmt->bind_param("ssssssssssss", 
        $applicationData['date'], 
        $applicationData['time'], 
        $applicationData['priest'], 
        $applicationData['first_name'], 
        $applicationData['middle_name'], 
        $applicationData['last_name'], 
        $applicationData['gender'], 
        $applicationData['age'], 
        $dateOfBirth, 
        $dateOfBaptism, 
        $applicationData['churchOfBaptism'], 
        $applicationData['placeOfBirth']
    );
    $stmt->execute();
    $confirmationID = $conn->insert_id;

    // Insert into confirmation_address
    $stmt = $conn->prepare("INSERT INTO confirmation_address (confirmationID, street, barangay, municipality, province, region) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssss", $confirmationID, $addressData['street'], $addressData['barangay'], $addressData['municipality'], $addressData['province'], $addressData['region']);
    $stmt->execute();

    // Insert into confirmation_father
    $stmt = $conn->prepare("INSERT INTO confirmation_father (confirmationID, first_name, middle_name, last_name, dateOfBirth, placeOfBirth, contact_number) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssss", $confirmationID, $fatherData['first_name'], $fatherData['middle_name'], $fatherData['last_name'], $fatherData['dateOfBirth'], $fatherData['placeOfBirth'], $fatherData['contact_number']);
    $stmt->execute();

    // Insert into confirmation_mother
    $stmt = $conn->prepare("INSERT INTO confirmation_mother (confirmationID, first_name, middle_name, last_name, dateOfBirth, placeOfBirth, contact_number) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssss", $confirmationID, $motherData['first_name'], $motherData['middle_name'], $motherData['last_name'], $motherData['dateOfBirth'], $motherData['placeOfBirth'], $motherData['contact_number']);
    $stmt->execute();

    // Handle requirements
    $uploadDir = "../uploads/confirmation_requirements/";
    if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);

    $baptism_cert = $birth_cert = $valid_ids = "";
    if (isset($_FILES['baptism_cert'])) {
        $baptism_cert = time() . "_" . basename($_FILES['baptism_cert']['name']);
        move_uploaded_file($_FILES['baptism_cert']['tmp_name'], $uploadDir . $baptism_cert);
    }
    if (isset($_FILES['birth_cert'])) {
        $birth_cert = time() . "_" . basename($_FILES['birth_cert']['name']);
        move_uploaded_file($_FILES['birth_cert']['tmp_name'], $uploadDir . $birth_cert);
    }
    if (isset($_FILES['valid_ids'])) {
        $valid_ids = time() . "_" . basename($_FILES['valid_ids']['name']);
        move_uploaded_file($_FILES['valid_ids']['tmp_name'], $uploadDir . $valid_ids);
    }

    $stmt = $conn->prepare("INSERT INTO confirmation_requirement (confirmationID, baptism_cert, baptism_cert_status, birth_cert, birth_cert_status, valid_ids, valid_ids_status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssss", $confirmationID, $baptism_cert, $_POST['baptism_cert_status'], $birth_cert, $_POST['birth_cert_status'], $valid_ids, $_POST['valid_ids_status']);
    $stmt->execute();

    // After execute statements, check for errors
    if ($stmt->error) {
        throw new Exception("Database error: " . $stmt->error);
    }

    $conn->commit();
    $response = ["success" => true, "message" => "Confirmation application submitted"];
} catch (Exception $e) {
    $conn->rollback();
    $response = ["success" => false, "message" => $e->getMessage()];
}
$conn->close();
echo json_encode($response);