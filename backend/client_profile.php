<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$servername = "localhost";
$username = "u572625467_divine_mercy";
$password = "Parish_12345";
$dbname = "u572625467_parish";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit();
}

// Handle GET request to fetch profile
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $clientID = isset($_GET['clientID']) ? $_GET['clientID'] : '';
    
    if (empty($clientID)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Client ID is required"]);
        exit();
    }
    
    $stmt = $conn->prepare("SELECT profileID, clientID, first_name, middle_name, last_name, 
        sex, age, date_of_birthday, contact_number, nationality, region, place_of_birth, 
        email, facebook_account, barangay, street, municipality, province, 
        profile_image, image_type FROM client_profile WHERE clientID = ?");
    $stmt->bind_param("i", $clientID);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $profile = $result->fetch_assoc();
        
        // If profile has image, convert it to base64
        if (!empty($profile['profile_image'])) {
            $profile['profile_image'] = 'data:' . $profile['image_type'] . ';base64,' . base64_encode($profile['profile_image']);
        }
        
        echo json_encode(["success" => true, "profile" => $profile]);
    } else {
        echo json_encode(["success" => true, "profile" => null, "message" => "No profile found"]);
    }
    
    $stmt->close();
}

// Handle POST request to save/update profile
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $clientID = isset($_POST['clientID']) ? $_POST['clientID'] : '';
    
    if (empty($clientID)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Client ID is required"]);
        exit();
    }
    
    // Get profile data from POST
    $data = (object)$_POST;
    
    // Handle image upload
    $imageData = null;
    $imageType = null;
    $hasNewImage = false;
    
    if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
        $hasNewImage = true;
        $imageData = file_get_contents($_FILES['profile_image']['tmp_name']);
        $imageType = $_FILES['profile_image']['type'];
        
        // Validate image
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!in_array($imageType, $allowedTypes)) {
            echo json_encode(["success" => false, "message" => "Invalid image type. Only JPG, PNG, and GIF are allowed."]);
            exit();
        }
        
        // Check image size (max 5MB)
        if ($_FILES['profile_image']['size'] > 5 * 1024 * 1024) {
            echo json_encode(["success" => false, "message" => "Image size too large. Maximum size is 5MB."]);
            exit();
        }
    }
    
    // Check if profile exists
    $stmt = $conn->prepare("SELECT profileID FROM client_profile WHERE clientID = ?");
    $stmt->bind_param("i", $clientID);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        // Update existing profile
        if ($hasNewImage) {
            // Update with new image
            $stmt = $conn->prepare("UPDATE client_profile SET 
                first_name = ?, middle_name = ?, last_name = ?, 
                sex = ?, age = ?, date_of_birthday = ?, 
                contact_number = ?, nationality = ?, region = ?, 
                place_of_birth = ?, email = ?, facebook_account = ?, 
                barangay = ?, street = ?, municipality = ?, province = ?,
                profile_image = ?, image_type = ?
                WHERE clientID = ?");
            
            $stmt->bind_param("ssssisssssssssssssi", 
                $data->first_name, $data->middle_name, $data->last_name,
                $data->sex, $data->age, $data->date_of_birthday,
                $data->contact_number, $data->nationality, $data->region,
                $data->place_of_birth, $data->email, $data->facebook_account,
                $data->barangay, $data->street, $data->municipality, $data->province,
                $imageData, $imageType, $clientID
            );
        } else {
            // Update without changing image
            $stmt = $conn->prepare("UPDATE client_profile SET 
                first_name = ?, middle_name = ?, last_name = ?, 
                sex = ?, age = ?, date_of_birthday = ?, 
                contact_number = ?, nationality = ?, region = ?, 
                place_of_birth = ?, email = ?, facebook_account = ?, 
                barangay = ?, street = ?, municipality = ?, province = ?
                WHERE clientID = ?");
            
            $stmt->bind_param("ssssisssssssssssi", 
                $data->first_name, $data->middle_name, $data->last_name,
                $data->sex, $data->age, $data->date_of_birthday,
                $data->contact_number, $data->nationality, $data->region,
                $data->place_of_birth, $data->email, $data->facebook_account,
                $data->barangay, $data->street, $data->municipality, $data->province,
                $clientID
            );
        }
    } else {
        // Insert new profile
        if ($hasNewImage) {
            // Insert with image
            $stmt = $conn->prepare("INSERT INTO client_profile 
                (clientID, first_name, middle_name, last_name, sex, age, 
                date_of_birthday, contact_number, nationality, region, 
                place_of_birth, email, facebook_account, barangay, 
                street, municipality, province, profile_image, image_type) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            $stmt->bind_param("issssissssssssssssss", 
                $clientID, $data->first_name, $data->middle_name, $data->last_name,
                $data->sex, $data->age, $data->date_of_birthday,
                $data->contact_number, $data->nationality, $data->region,
                $data->place_of_birth, $data->email, $data->facebook_account,
                $data->barangay, $data->street, $data->municipality, $data->province,
                $imageData, $imageType
            );
        } else {
            // Insert without image
            $stmt = $conn->prepare("INSERT INTO client_profile 
                (clientID, first_name, middle_name, last_name, sex, age, 
                date_of_birthday, contact_number, nationality, region, 
                place_of_birth, email, facebook_account, barangay, 
                street, municipality, province) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            $stmt->bind_param("issssisssssssssss", 
                $clientID, $data->first_name, $data->middle_name, $data->last_name,
                $data->sex, $data->age, $data->date_of_birthday,
                $data->contact_number, $data->nationality, $data->region,
                $data->place_of_birth, $data->email, $data->facebook_account,
                $data->barangay, $data->street, $data->municipality, $data->province
            );
        }
    }
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Profile saved successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error saving profile: " . $stmt->error]);
    }
    
    $stmt->close();
}

$conn->close();
?>