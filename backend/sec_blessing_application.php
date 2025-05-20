<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Respond to preflight (OPTIONS) request
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

// Database connection
$servername = "localhost";
$username = "u572625467_divine_mercy";
$password = "Parish_12345";
$dbname = "u572625467_parish";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Database connection failed"]));
}

// Set content type header
header("Content-Type: application/json");

// Default response
$response = [
    "success" => false,
    "message" => "Unknown error occurred"
];

// At the start of the file, after error reporting
error_log("Blessing application request received");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        // Log received data
        error_log("POST data received: " . print_r($_POST, true));
        error_log("FILES data received: " . print_r($_FILES, true));

        // Start transaction
        $conn->begin_transaction();

        // Get form data
        $blessingData = json_decode($_POST['blessingData'], true);
        $addressData = json_decode($_POST['addressData'], true);
        $blessingTypeData = json_decode($_POST['blessingTypeData'], true);
 
        // Log decoded data
        error_log("Decoded data:");
        error_log("blessingData: " . print_r($blessingData, true));
        error_log("addressData: " . print_r($addressData, true));
        error_log("blessingTypeData: " . print_r($blessingTypeData, true));

        // Check if there's already a blessing application with the same date and time
        $checkStmt = $conn->prepare("SELECT blessingID FROM blessing_application WHERE preferredDate = ? AND preferredTime = ? AND status != 'cancelled' AND status != 'completed'");
        $checkStmt->bind_param("ss", 
            $blessingData['preferredDate'],
            $blessingData['preferredTime']
        );
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0) {
            throw new Exception("There is already a blessing scheduled for this date and time. Please select a different schedule.");
        }

        // SQL statement without clientID
        $stmt = $conn->prepare("INSERT INTO blessing_application (preferredDate, preferredTime, firstName, middleName, lastName, contactNumber, emailAddress, placeOfBirth, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')");
        
        if (!$stmt) {
            error_log("Prepare failed: " . $conn->error);
            throw new Exception("Database prepare failed: " . $conn->error);
        }

        // bind_param without clientID
        $stmt->bind_param("ssssssss", 
            $blessingData['preferredDate'],
            $blessingData['preferredTime'],
            $blessingData['firstName'],
            $blessingData['middleName'],
            $blessingData['lastName'],
            $blessingData['contactNumber'],
            $blessingData['emailAddress'],
            $blessingData['placeOfBirth']
        );
        
        if (!$stmt->execute()) {
            error_log("Execute failed: " . $stmt->error);
            throw new Exception("Database execute failed: " . $stmt->error);
        }

        $blessingID = $conn->insert_id;
        error_log("Inserted blessing_application with ID: " . $blessingID);

        // Insert into blessing_address
        $stmt = $conn->prepare("INSERT INTO blessing_address (blessingID, street, barangay, municipality, province) VALUES (?, ?, ?, ?, ?)");
        
        $stmt->bind_param("issss", 
            $blessingID,
            $addressData['street'],
            $addressData['barangay'],
            $addressData['municipality'],
            $addressData['province']
        );
        
        $stmt->execute();

        // Insert into blessing_type
        $stmt = $conn->prepare("INSERT INTO blessing_type (blessingID, blessing_type, purpose, note) VALUES (?, ?, ?, ?)");
        
        $stmt->bind_param("isss", 
            $blessingID,
            $blessingTypeData['blessing_type'],
            $blessingTypeData['purpose'],
            $blessingTypeData['note']
        );
        
        $stmt->execute();

        // Commit transaction
        $conn->commit();

        // Send confirmation email - without clientID
        $emailData = [
            'blessingID' => $blessingID,
            'blessingData' => $blessingData
        ];

        $ch = curl_init('http://parishofdivinemercy.com/backend/send_blessing_email.php');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($emailData));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        $emailResponse = curl_exec($ch);
        curl_close($ch);

        $response["success"] = true;
        $response["message"] = "Blessing application submitted successfully";
        $response["blessingID"] = $blessingID;

    } catch (Exception $e) {
        error_log("Error in blessing_application.php: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        
        // Rollback transaction on error
        $conn->rollback();
        $response["success"] = false;
        $response["message"] = "Error: " . $e->getMessage();
    }
}

$conn->close();
echo json_encode($response);
?>