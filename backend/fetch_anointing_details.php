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

// Function to format time from 24-hour to 12-hour AM/PM format
function formatTimeTo12Hour($time24) {
    if (!$time24) return '';
    
    // Handle different time formats that might come from database
    $timeString = $time24;
    
    // If it's in HH:MM:SS format, extract just HH:MM
    if (strpos($timeString, ':') !== false) {
        $parts = explode(':', $timeString);
        $timeString = $parts[0] . ':' . $parts[1];
    }
    
    // Create a DateTime object and format to 12-hour time
    try {
        $date = DateTime::createFromFormat('H:i', $timeString);
        if ($date) {
            return $date->format('g:i A'); // 12-hour format with AM/PM
        }
    } catch (Exception $e) {
        error_log("Time formatting error: " . $e->getMessage());
    }
    
    return $time24; // Return original if formatting fails
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

    // Check if anointingID is provided
    if (!isset($_GET['anointingID']) || empty($_GET['anointingID'])) {
        throw new Exception("Anointing ID is required");
    }

    $anointingID = intval($_GET['anointingID']);
    
    // Start transaction
    $conn->begin_transaction();

    try {
        // 1. Fetch anointing application data
        $sql = "SELECT * FROM anointing_application WHERE anointingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $anointingID);
        $stmt->execute();
        $anointingResult = $stmt->get_result();
        $anointing = $anointingResult->fetch_assoc();
        $stmt->close();
        
        if (!$anointing) {
            throw new Exception("Anointing record not found");
        }

        // Format the time to 12-hour format
        if (isset($anointing['timeOfAnointing'])) {
            $anointing['timeOfAnointingFormatted'] = formatTimeTo12Hour($anointing['timeOfAnointing']);
        }

        // 2. Fetch contact information
        $sql = "SELECT * FROM anointing_contactinfo WHERE anointingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $anointingID);
        $stmt->execute();
        $contactResult = $stmt->get_result();
        $contact = $contactResult->fetch_assoc();
        $stmt->close();

        // 3. Fetch father information
        $sql = "SELECT * FROM anointing_father WHERE anointingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $anointingID);
        $stmt->execute();
        $fatherResult = $stmt->get_result();
        $father = $fatherResult->fetch_assoc();
        $stmt->close();

        // 4. Fetch mother information
        $sql = "SELECT * FROM anointing_mother WHERE anointingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $anointingID);
        $stmt->execute();
        $motherResult = $stmt->get_result();
        $mother = $motherResult->fetch_assoc();
        $stmt->close();

        // 5. Fetch spouse information
        $sql = "SELECT * FROM anointing_spouse WHERE anointingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $anointingID);
        $stmt->execute();
        $spouseResult = $stmt->get_result();
        $spouse = $spouseResult->fetch_assoc();
        $stmt->close();

        // 6. Fetch location information
        $sql = "SELECT * FROM anointing_location WHERE anointingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $anointingID);
        $stmt->execute();
        $locationResult = $stmt->get_result();
        $location = $locationResult->fetch_assoc();
        $stmt->close();

        // 7. Fetch additional information
        $sql = "SELECT * FROM anointing_additionalinfo WHERE anointingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $anointingID);
        $stmt->execute();
        $additionalInfoResult = $stmt->get_result();
        $additionalInfo = $additionalInfoResult->fetch_assoc();
        $stmt->close();

        // 8. Fetch requirements
        $sql = "SELECT * FROM anointing_requirement WHERE anointingID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $anointingID);
        $stmt->execute();
        $requirementsResult = $stmt->get_result();
        $requirements = $requirementsResult->fetch_assoc();
        $stmt->close();

        // Commit transaction
        $conn->commit();

        // Debug logging
        error_log("=== FETCH DEBUG ===");
        error_log("Anointing data: " . print_r($anointing, true));
        error_log("Contact data: " . print_r($contact, true));
        error_log("Father data: " . print_r($father, true));
        error_log("Mother data: " . print_r($mother, true));
        error_log("Spouse data: " . print_r($spouse, true));
        error_log("Location data: " . print_r($location, true));
        error_log("Additional data: " . print_r($additionalInfo, true));
        error_log("Requirements data: " . print_r($requirements, true));

        // Combine all data
        $anointingData = [
            'anointing' => $anointing,
            'contact' => $contact,
            'father' => $father,
            'mother' => $mother,
            'spouse' => $spouse,
            'locationInfo' => $location,
            'additionalInfo' => $additionalInfo,
            'requirements' => $requirements
        ];

        echo json_encode([
            "success" => true,
            "data" => $anointingData
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