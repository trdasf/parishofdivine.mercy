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

// Enhanced logging for debugging
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("POST data: " . print_r($_POST, true));
error_log("FILES data: " . print_r($_FILES, true));
error_log("Specifically checking for deceasedAge: " . (isset($_POST['deceasedAge']) ? $_POST['deceasedAge'] : 'NOT PROVIDED'));

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
        // Extract and validate clientID
        $clientID = $_POST['clientID'] ?? null;
        
        error_log("Received clientID: " . $clientID);
        
        if (!$clientID) {
            throw new Exception("Client ID is required");
        }

        // Validate that clientID is a number
        if (!is_numeric($clientID)) {
            throw new Exception("Invalid Client ID format");
        }

        // Verify that this client exists
        $checkClient = "SELECT clientID FROM client_registration WHERE clientID = ?";
        $stmt = $conn->prepare($checkClient);
        $stmt->bind_param("i", $clientID);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception("Client not found");
        }
        $stmt->close();

        // Check if there's already a funeral mass application with the same date and time
        $checkStmt = $conn->prepare("SELECT funeralID FROM funeral_mass_application WHERE dateOfFuneralMass = ? AND timeOfFuneralMass = ? AND status != 'cancelled' AND status != 'completed'");
        $checkStmt->bind_param("ss", 
            $_POST['dateOfFuneralMass'],
            $_POST['timeOfFuneralMass']
        );
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            throw new Exception("There is already a funeral mass scheduled for this date and time. Please select a different schedule.");
        }
        $checkStmt->close();

        // Insert into funeral_mass_application table
        $sql = "INSERT INTO funeral_mass_application (
            clientID, dateOfFuneralMass, timeOfFuneralMass,
            status, created_at
        ) VALUES (?, ?, ?, 'Pending', NOW())";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("iss", 
            $clientID, $_POST['dateOfFuneralMass'], $_POST['timeOfFuneralMass']
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Error inserting funeral mass application: " . $stmt->error);
        }
        
        $funeralID = $conn->insert_id;
        error_log("Created funeral mass application with ID: " . $funeralID);
        $stmt->close();

        // Ensure the age value is available
        $deceasedAge = $_POST['deceasedAge'];
        if (empty($deceasedAge) && !empty($_POST['deceasedDateOfBirth'])) {
            // Calculate age if not provided but date of birth is available
            $birthDate = new DateTime($_POST['deceasedDateOfBirth']);
            $today = new DateTime();
            $age = $today->diff($birthDate)->y;
            $deceasedAge = $age;
            error_log("Calculated age: " . $deceasedAge);
        }

        error_log("Using deceasedAge value: " . $deceasedAge);

        // Insert into deceased_info table - use funeralID instead of clientID
        $sql = "INSERT INTO deceased_info (
            funeralID, first_name, middle_name, last_name,
            sex, age, dateOfBirth, dateOfDeath,
            causeOfDeath, wake_location, burial_location
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Prepare failed for deceased_info: " . $conn->error);
        }

        $stmt->bind_param("issssssssss", 
            $funeralID, $_POST['deceasedFirstName'], $_POST['deceasedMiddleName'], 
            $_POST['deceasedLastName'], $_POST['deceasedSex'], $deceasedAge, 
            $_POST['deceasedDateOfBirth'], $_POST['deceasedDateOfDeath'], 
            $_POST['causeOfDeath'], $_POST['wakeLocation'], $_POST['burialLocation']
        );
        
        if (!$stmt->execute()) {
            error_log("SQL Error: " . $stmt->error);
            throw new Exception("Error inserting deceased information: " . $stmt->error);
        }
        
        $deceasedID = $conn->insert_id;
        error_log("Created deceased_info with ID: " . $deceasedID);
        $stmt->close();

        // Insert into requester_info table - use funeralID instead of clientID
        $sql = "INSERT INTO requester_info (
            funeralID, first_name, middle_name, last_name,
            relationship, contact_number, email
        ) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Prepare failed for requester_info: " . $conn->error);
        }

        $stmt->bind_param("issssss", 
            $funeralID, $_POST['requesterFirstName'], $_POST['requesterMiddleName'], 
            $_POST['requesterLastName'], $_POST['relationship'], 
            $_POST['contactNumber'], $_POST['email']
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Error inserting requester information: " . $stmt->error);
        }
        
        $requesterID = $conn->insert_id;
        error_log("Created requester_info with ID: " . $requesterID);
        $stmt->close();

        // Insert into deceased_address table - use funeralID instead of clientID
        $sql = "INSERT INTO deceased_address (
            funeralID, barangay, street, municipality, province, region
        ) VALUES (?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Prepare failed for deceased_address: " . $conn->error);
        }

        $stmt->bind_param("isssss", 
            $funeralID, $_POST['barangay'], $_POST['street'], 
            $_POST['municipality'], $_POST['province'], $_POST['region']
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Error inserting address: " . $stmt->error);
        }
        
        $addressID = $conn->insert_id;
        error_log("Created deceased_address with ID: " . $addressID);
        $stmt->close();

        // Create a burial_requirements record - use funeralID instead of clientID
        $sql = "INSERT INTO burial_requirements (funeralID) VALUES (?)";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Prepare failed for burial_requirements: " . $conn->error);
        }

        $stmt->bind_param("i", $funeralID);
        if (!$stmt->execute()) {
            throw new Exception("Error creating requirement record: " . $stmt->error);
        }
        $burialID = $conn->insert_id;
        error_log("Created burial_requirements with ID: " . $burialID);
        $stmt->close();

        // Handle file uploads
        $uploadDir = 'uploads/burial_requirements/';
        if (!file_exists($uploadDir)) {
            if (!mkdir($uploadDir, 0777, true)) {
                throw new Exception("Failed to create upload directory");
            }
        }

        // Process uploaded files
        foreach ($_FILES as $key => $file) {
            if ($file['error'] === UPLOAD_ERR_OK) {
                $requirementType = str_replace('file_', '', $key);
                
                // Valid requirement types
                $validRequirements = ['death_certificate', 'parish_clearance', 'permit_to_bury', 
                                      'certificate_baptism', 'certificate_confirmation'];
                
                if (in_array($requirementType, $validRequirements)) {
                    // Generate unique filename
                    $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
                    $fileName = time() . '_' . $requirementType . '_' . uniqid() . '.' . $fileExtension;
                    $filePath = $uploadDir . $fileName;
                    
                    error_log("Attempting to upload file: " . $file['name'] . " to " . $filePath);
                    
                    if (move_uploaded_file($file['tmp_name'], $filePath)) {
                        $column = $requirementType;
                        $statusColumn = $requirementType . '_status';
                        
                        $sql = "UPDATE burial_requirements SET $column = ?, $statusColumn = 'Submitted' WHERE burialID = ?";
                        $stmt = $conn->prepare($sql);
                        if (!$stmt) {
                            throw new Exception("Prepare failed for file update: " . $conn->error);
                        }
                        
                        $stmt->bind_param("si", $filePath, $burialID);
                        
                        if (!$stmt->execute()) {
                            throw new Exception("Error updating requirement for $requirementType: " . $stmt->error);
                        }
                        error_log("Successfully uploaded and updated $requirementType");
                        $stmt->close();
                    } else {
                        error_log("Failed to move uploaded file: " . $file['name']);
                    }
                }
            } else {
                error_log("File upload error for $key: " . $file['error']);
            }
        }

        // Double-check that age was saved correctly
        $checkAgeSql = "SELECT age FROM deceased_info WHERE funeralID = ?";
        $checkStmt = $conn->prepare($checkAgeSql);
        $checkStmt->bind_param("i", $funeralID);
        $checkStmt->execute();
        $ageResult = $checkStmt->get_result();
        $ageRow = $ageResult->fetch_assoc();
        error_log("After insert, age value in database: " . ($ageRow ? $ageRow['age'] : 'NOT FOUND'));
        $checkStmt->close();

        // Commit transaction
        $conn->commit();
        error_log("Transaction committed successfully");

        echo json_encode([
            "success" => true,
            "message" => "Funeral mass application submitted successfully",
            "funeralID" => $funeralID,
            "clientID" => $clientID,
            "savedAge" => $ageRow ? $ageRow['age'] : null
        ]);

    } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        error_log("Transaction rolled back due to error: " . $e->getMessage());
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
            "post_data" => $_POST,
            "files_data" => $_FILES,
            "received_clientID" => $_POST['clientID'] ?? 'not provided',
            "received_age" => $_POST['deceasedAge'] ?? 'not provided'
        ]
    ]);
}
?>