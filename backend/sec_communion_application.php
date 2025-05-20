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

    // Check if there's already a communion application with the same date and time
    $checkStmt = $conn->prepare("SELECT communionID FROM communion_application WHERE date = ? AND time = ? AND status != 'cancelled' AND status != 'completed'");
    $checkStmt->bind_param("ss", 
        $applicationData['date'],
        $applicationData['time']
    );
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    
    if ($checkResult->num_rows > 0) {
        throw new Exception("There is already a holy communion scheduled for this date and time. Please select a different schedule.");
    }
    $checkStmt->close();

    // Format the dates properly (ensure yyyy-mm-dd format)
    $dateOfBirth = $applicationData['dateOfBirth'];
    $dateOfBaptism = $applicationData['dateOfBaptism'];
    
    // Ensure gender is stored as a string, not as a number
    $gender = strval($applicationData['gender']);
    
    // Debug log
    error_log("Date of Birth: " . $dateOfBirth);
    error_log("Date of Baptism: " . $dateOfBaptism);
    error_log("Gender value: " . $gender);
    error_log("Gender type: " . gettype($gender));
    error_log("Gender value from source: " . $applicationData['gender']);
    error_log("Gender source type: " . gettype($applicationData['gender']));

    // Insert into communion_application - removed clientID
    $stmt = $conn->prepare("INSERT INTO communion_application (date, time, first_name, middle_name, last_name, gender, age, dateOfBirth, dateOfBaptism, churchOfBaptism, placeOfBirth, status) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')");
    $stmt->bind_param("ssssssissss", 
        $applicationData['date'], 
        $applicationData['time'], 
        $applicationData['first_name'], 
        $applicationData['middle_name'], 
        $applicationData['last_name'], 
        $gender,
        $applicationData['age'], 
        $dateOfBirth, 
        $dateOfBaptism, 
        $applicationData['churchOfBaptism'], 
        $applicationData['placeOfBirth']
    );
    $stmt->execute();
    $communionID = $conn->insert_id;

    // Insert into communion_address - Now including region field
    // Check if region exists in addressData
    if (isset($addressData['region']) && $addressData['region'] != '') {
        $stmt = $conn->prepare("INSERT INTO communion_address (communionID, street, barangay, municipality, province, region) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssss", 
            $communionID, 
            $addressData['street'], 
            $addressData['barangay'], 
            $addressData['municipality'], 
            $addressData['province'],
            $addressData['region']
        );
    } else {
        $stmt = $conn->prepare("INSERT INTO communion_address (communionID, street, barangay, municipality, province) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("issss", 
            $communionID, 
            $addressData['street'], 
            $addressData['barangay'], 
            $addressData['municipality'], 
            $addressData['province']
        );
    }
    $stmt->execute();

    // Format dates for parent information too if needed
    if (isset($fatherData['dateOfBirth']) && !empty($fatherData['dateOfBirth'])) {
        $fatherData['dateOfBirth'] = date('Y-m-d', strtotime($fatherData['dateOfBirth']));
    }
    
    if (isset($motherData['dateOfBirth']) && !empty($motherData['dateOfBirth'])) {
        $motherData['dateOfBirth'] = date('Y-m-d', strtotime($motherData['dateOfBirth']));
    }

    // Insert into communion_father
    $stmt = $conn->prepare("INSERT INTO communion_father (communionID, first_name, middle_name, last_name, dateOfBirth, placeOfBirth, contact_number) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssss", 
        $communionID, 
        $fatherData['first_name'], 
        $fatherData['middle_name'], 
        $fatherData['last_name'], 
        $fatherData['dateOfBirth'], 
        $fatherData['placeOfBirth'], 
        $fatherData['contact_number']
    );
    $stmt->execute();

    // Insert into communion_mother
    $stmt = $conn->prepare("INSERT INTO communion_mother (communionID, first_name, middle_name, last_name, dateOfBirth, placeOfBirth, contact_number) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssss", 
        $communionID, 
        $motherData['first_name'], 
        $motherData['middle_name'], 
        $motherData['last_name'], 
        $motherData['dateOfBirth'], 
        $motherData['placeOfBirth'], 
        $motherData['contact_number']
    );
    $stmt->execute();

    $conn->commit();
    $response = ["success" => true, "message" => "Communion application submitted"];
} catch (Exception $e) {
    $conn->rollback();
    $response = ["success" => false, "message" => $e->getMessage()];
}
$conn->close();
echo json_encode($response);