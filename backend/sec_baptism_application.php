<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set JSON header
header("Content-Type: application/json; charset=UTF-8");

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log incoming request
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("POST data: " . print_r($_POST, true));
error_log("Region value: " . ($_POST['region'] ?? 'not set'));
error_log("AddressRegion value: " . ($_POST['addressRegion'] ?? 'not set'));

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

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Method not allowed. Expected POST, got " . $_SERVER['REQUEST_METHOD']);
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // Removed clientID extraction and validation

        // Validate and format dateOfBaptism
        $dateOfBaptism = $_POST['dateOfBaptism'] ?? null;
        if ($dateOfBaptism) {
            // Validate date format
            $date = DateTime::createFromFormat('Y-m-d', $dateOfBaptism);
            if (!$date || $date->format('Y-m-d') !== $dateOfBaptism) {
                throw new Exception("Invalid date format for baptism date. Expected YYYY-MM-DD");
            }
        }

        // Insert into baptism_application table (with region added and clientID removed)
        $sql = "INSERT INTO baptism_application (
            dateOfBaptism, timeOfBaptism, priestName,
            firstName, middleName, lastName, sex, age, dateOfBirth, placeOfBirth,
            region, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("sssssssssss", 
            $_POST['dateOfBaptism'], $_POST['timeOfBaptism'], 
            $_POST['priestName'], $_POST['firstName'], $_POST['middleName'], 
            $_POST['lastName'], $_POST['sex'], $_POST['age'], $_POST['dateOfBirth'], 
            $_POST['placeOfBirth'], $_POST['region']
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Error inserting baptism application: " . $stmt->error);
        }
        
        $baptismID = $conn->insert_id;
        error_log("Created baptism application with ID: " . $baptismID);
        $stmt->close();

        // Insert into baptism_parents table
        $sql = "INSERT INTO baptism_parents (
            baptismID, fatherFirstName, fatherMiddleName, fatherLastName,
            fatherPlaceOfBirth, fatherDateOfBirth, fatherEducation,
            fatherOccupation, fatherContact, motherFirstName, motherMiddleName,
            motherLastName, motherPlaceOfBirth, motherDateOfBirth,
            motherEducation, motherOccupation, motherContact
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("issssssssssssssss", 
            $baptismID, $_POST['fatherFirstName'], $_POST['fatherMiddleName'], 
            $_POST['fatherLastName'], $_POST['fatherPlaceOfBirth'], 
            $_POST['fatherDateOfBirth'], $_POST['fatherEducation'], 
            $_POST['fatherOccupation'], $_POST['fatherContact'], 
            $_POST['motherFirstName'], $_POST['motherMiddleName'], 
            $_POST['motherLastName'], $_POST['motherPlaceOfBirth'], 
            $_POST['motherDateOfBirth'], $_POST['motherEducation'], 
            $_POST['motherOccupation'], $_POST['motherContact']
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Error inserting parents information: " . $stmt->error);
        }
        
        $bparentsID = $conn->insert_id;
        $stmt->close();

        // Insert into parent_maritalstatus table
        $sql = "INSERT INTO parent_maritalstatus (bparentsID, maritalStatus, yearsMarried) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $yearsMarried = $_POST['yearsMarried'] ?? null;
        $stmt->bind_param("iss", $bparentsID, $_POST['maritalStatus'], $yearsMarried);
        
        if (!$stmt->execute()) {
            throw new Exception("Error inserting marital status: " . $stmt->error);
        }
        $stmt->close();

        // Insert into baptism_address table
        $sql = "INSERT INTO baptism_address (baptismID, street, barangay, municipality, province, region) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("isssss", $baptismID, $_POST['street'], $_POST['barangay'], $_POST['municipality'], $_POST['province'], $_POST['addressRegion']);
        
        if (!$stmt->execute()) {
            throw new Exception("Error inserting address: " . $stmt->error);
        }
        $stmt->close();

        // Insert godparents
        $godFathers = json_decode($_POST['godFathers'], true) ?? [];
        $godMothers = json_decode($_POST['godMothers'], true) ?? [];
        
        $sql = "INSERT INTO baptism_godparents (baptismID, name, type) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($sql);
        
        // Insert godfathers
        foreach ($godFathers as $godfather) {
            $type = 'godfather';
            $stmt->bind_param("iss", $baptismID, $godfather, $type);
            if (!$stmt->execute()) {
                throw new Exception("Error inserting godfather: " . $stmt->error);
            }
        }
        
        // Insert godmothers
        foreach ($godMothers as $godmother) {
            $type = 'godmother';
            $stmt->bind_param("iss", $baptismID, $godmother, $type);
            if (!$stmt->execute()) {
                throw new Exception("Error inserting godmother: " . $stmt->error);
            }
        }
        $stmt->close();

        // Commit transaction
        $conn->commit();

        echo json_encode([
            "success" => true,
            "message" => "Baptism application submitted successfully",
            "baptismID" => $baptismID
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
        "message" => $e->getMessage(),
        "debug" => [
            "method" => $_SERVER['REQUEST_METHOD'],
            "post_data" => $_POST
        ]
    ]);
}
?>