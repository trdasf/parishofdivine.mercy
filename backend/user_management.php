<?php
// Disable HTML error reporting and enable JSON error responses
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set JSON header at the very beginning
header("Content-Type: application/json; charset=UTF-8");

try {
    // CORS headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    // Handle preflight request (OPTIONS)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    // Database connection setup
    $servername = "localhost";
    $username = "u572625467_divine_mercy";  
    $password = "Parish_12345";   
    $dbname = "u572625467_parish";  

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check the database connection
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    // Read and decode JSON data from the request for POST and PUT methods
    if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
        $json = file_get_contents("php://input");
        $data = json_decode($json);

        // Check if JSON parsing failed
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON: " . json_last_error_msg());
        }
    }

    // Handle different HTTP methods
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'POST': // Create new user
            // Validate received data
            if (!$data || !isset($data->firstName, $data->lastName, $data->gender, $data->dateOfBirth, 
                $data->contactNumber, $data->nationality, $data->religion, $data->email, 
                $data->street, $data->barangay, $data->municipality, $data->province, 
                $data->position, $data->membershipStatus, $data->joinedDate, $data->password)) {
                throw new Exception("Incomplete data provided. Please fill in all required fields.");
            }

            // Sanitize input data
            $firstName = $conn->real_escape_string($data->firstName);
            $middleName = isset($data->middleName) ? $conn->real_escape_string($data->middleName) : '';
            $lastName = $conn->real_escape_string($data->lastName);
            $gender = $conn->real_escape_string($data->gender);
            $dateOfBirth = $conn->real_escape_string($data->dateOfBirth);
            $contactNumber = $conn->real_escape_string($data->contactNumber);
            $nationality = $conn->real_escape_string($data->nationality);
            $religion = $conn->real_escape_string($data->religion);
            $email = $conn->real_escape_string($data->email);
            $street = $conn->real_escape_string($data->street);
            $barangay = $conn->real_escape_string($data->barangay);
            $municipality = $conn->real_escape_string($data->municipality);
            $province = $conn->real_escape_string($data->province);
            $position = $conn->real_escape_string($data->position);
            $membershipStatus = $conn->real_escape_string($data->membershipStatus);
            $joinedDate = $conn->real_escape_string($data->joinedDate);

            // Validate email format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode([
                    "success" => false, 
                    "message" => "Invalid email format. Please use a valid email address.",
                    "error" => "invalid_email"
                ]);
                exit();
            }

            // Validate contact number (basic validation)
            if (!preg_match('/^[0-9+\-\s()]+$/', $contactNumber)) {
                http_response_code(400);
                echo json_encode([
                    "success" => false, 
                    "message" => "Invalid contact number format.",
                    "error" => "invalid_contact"
                ]);
                exit();
            }

            // Validate password
            if (strlen($data->password) < 6) {
                http_response_code(400);
                echo json_encode([
                    "success" => false, 
                    "message" => "Password must be at least 6 characters long.",
                    "error" => "invalid_password"
                ]);
                exit();
            }

            // Hash the password securely
            $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);

            // Check if the email is already registered
            $stmt = $conn->prepare("SELECT * FROM user_management WHERE email = ?");
            if (!$stmt) {
                throw new Exception("Database prepare error: " . $conn->error);
            }

            $stmt->bind_param("s", $email);
            if (!$stmt->execute()) {
                throw new Exception("Database execute error: " . $stmt->error);
            }

            $emailCheckResult = $stmt->get_result();

            if ($emailCheckResult->num_rows > 0) {
                http_response_code(409); // Conflict status code
                echo json_encode([
                    "success" => false, 
                    "message" => "An account with this email already exists.",
                    "error" => "email_exists"
                ]);
                $stmt->close();
                exit();
            }
            $stmt->close();

            // Process profile image for database storage
            $profileData = null;
            if (isset($data->profile) && !empty($data->profile)) {
                // Extract the actual base64 data part (remove the data:image/xyz;base64, part)
                if (preg_match('/^data:image\/(\w+);base64,/', $data->profile, $matches)) {
                    $imageType = $matches[1];
                    $base64Data = substr($data->profile, strpos($data->profile, ',') + 1);
                    $profileData = $base64Data; // Store as base64 string
                } else {
                    // If it doesn't match the pattern, it might already be a base64 string
                    $profileData = $data->profile;
                }
            }

            // Prepare the SQL statement for insertion
            if ($profileData === null) {
                // SQL without profile image
                $stmt = $conn->prepare("INSERT INTO user_management (firstName, middleName, lastName, gender, 
                                     dateOfBirth, contactNumber, nationality, religion, email, 
                                     street, barangay, municipality, province, position, 
                                     membershipStatus, joinedDate, password) 
                                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                
                if (!$stmt) {
                    throw new Exception("Database prepare error: " . $conn->error);
                }

                $stmt->bind_param("sssssssssssssssss", 
                    $firstName, $middleName, $lastName, $gender,
                    $dateOfBirth, $contactNumber, $nationality, $religion, $email,
                    $street, $barangay, $municipality, $province, $position,
                    $membershipStatus, $joinedDate, $hashed_password);
            } else {
                // SQL with profile image
                $stmt = $conn->prepare("INSERT INTO user_management (firstName, middleName, lastName, profile, gender, 
                                     dateOfBirth, contactNumber, nationality, religion, email, 
                                     street, barangay, municipality, province, position, 
                                     membershipStatus, joinedDate, password) 
                                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                
                if (!$stmt) {
                    throw new Exception("Database prepare error: " . $conn->error);
                }

                $stmt->bind_param("ssssssssssssssssss", 
                    $firstName, $middleName, $lastName, $profileData, $gender,
                    $dateOfBirth, $contactNumber, $nationality, $religion, $email,
                    $street, $barangay, $municipality, $province, $position,
                    $membershipStatus, $joinedDate, $hashed_password);
            }

            if ($stmt->execute()) {
                http_response_code(201); // Created status code
                echo json_encode([
                    "success" => true, 
                    "message" => "User added successfully.",
                    "userID" => $conn->insert_id
                ]);
            } else {
                throw new Exception("Database error: " . $stmt->error);
            }

            $stmt->close();
            break;

        case 'GET': // Fetch users
            // Check if a specific user ID is requested
            if (isset($_GET['userID'])) {
                $userID = $conn->real_escape_string($_GET['userID']);
                $stmt = $conn->prepare("SELECT * FROM user_management WHERE userID = ?");
                $stmt->bind_param("i", $userID);
            } else {
                // Optional filtering by position
                if (isset($_GET['position']) && !empty($_GET['position'])) {
                    $position = $conn->real_escape_string($_GET['position']);
                    $stmt = $conn->prepare("SELECT * FROM user_management WHERE position = ? ORDER BY userID DESC");
                    $stmt->bind_param("s", $position);
                } else {
                    // Get all users
                    $stmt = $conn->prepare("SELECT * FROM user_management ORDER BY userID DESC");
                }
            }

            $stmt->execute();
            $result = $stmt->get_result();
            
            $users = [];
            while ($row = $result->fetch_assoc()) {
                // Don't include the password in the response
                unset($row['password']);
                
                // If profile already contains data:image format, use as is
                if ($row['profile'] !== null && !strpos($row['profile'], 'data:image') === 0) {
                    $row['profile'] = 'data:image/jpeg;base64,' . $row['profile'];
                }
                
                $users[] = $row;
            }
            
            echo json_encode([
                "success" => true,
                "users" => $users
            ]);
            
            $stmt->close();
            break;

        case 'PUT': // Update user
            if (!isset($data->userID)) {
                throw new Exception("User ID is required for updates.");
            }
            
            $userID = $conn->real_escape_string($data->userID);
            
            // Build the update query dynamically based on provided fields
            $updateFields = [];
            $params = [];
            $types = "";
            
            // Define which fields can be updated
            $allowedFields = [
                'firstName' => 's', 'middleName' => 's', 'lastName' => 's', 
                'gender' => 's', 'dateOfBirth' => 's',
                'contactNumber' => 's', 'nationality' => 's', 'religion' => 's', 
                'email' => 's', 'street' => 's', 'barangay' => 's', 
                'municipality' => 's', 'province' => 's', 'position' => 's',
                'membershipStatus' => 's', 'joinedDate' => 's'
            ];
            
            // Process profile image if provided
            if (isset($data->profile) && !empty($data->profile)) {
                $profileData = null;
                
                // Extract the actual base64 data part
                if (preg_match('/^data:image\/(\w+);base64,/', $data->profile, $matches)) {
                    $base64Data = substr($data->profile, strpos($data->profile, ',') + 1);
                    $profileData = $base64Data; // Store as base64 string
                } else {
                    // If it doesn't match the pattern, it might already be a base64 string
                    $profileData = $data->profile;
                }
                
                // Add profile to update fields
                $updateFields[] = "profile = ?";
                $params[] = $profileData;
                $types .= "s"; // string data for base64
            }
            
            // If password is provided, validate and hash it
            if (isset($data->password) && !empty($data->password)) {
                // Validate password
                if (strlen($data->password) < 6) {
                    http_response_code(400);
                    echo json_encode([
                        "success" => false, 
                        "message" => "Password must be at least 6 characters long.",
                        "error" => "invalid_password"
                    ]);
                    exit();
                }
                
                $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
                $updateFields[] = "password = ?";
                $params[] = $hashed_password;
                $types .= "s";
            }
            
            // If email is changed, check if it's already taken
            if (isset($data->email)) {
                $email = $conn->real_escape_string($data->email);
                
                // Validate email format
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    http_response_code(400);
                    echo json_encode([
                        "success" => false, 
                        "message" => "Invalid email format.",
                        "error" => "invalid_email"
                    ]);
                    exit();
                }
                
                // Get current email
                $stmt = $conn->prepare("SELECT email FROM user_management WHERE userID = ?");
                $stmt->bind_param("i", $userID);
                $stmt->execute();
                $result = $stmt->get_result();
                
                if ($result->num_rows === 0) {
                    http_response_code(404);
                    echo json_encode([
                        "success" => false, 
                        "message" => "User not found.",
                        "error" => "user_not_found"
                    ]);
                    $stmt->close();
                    exit();
                }
                
                $currentUser = $result->fetch_assoc();
                $stmt->close();
                
                // If email is being changed, check if the new one is available
                if ($email !== $currentUser['email']) {
                    $stmt = $conn->prepare("SELECT * FROM user_management WHERE email = ? AND userID != ?");
                    $stmt->bind_param("si", $email, $userID);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    
                    if ($result->num_rows > 0) {
                        http_response_code(409);
                        echo json_encode([
                            "success" => false, 
                            "message" => "An account with this email already exists.",
                            "error" => "email_exists"
                        ]);
                        $stmt->close();
                        exit();
                    }
                    $stmt->close();
                }
                
                $updateFields[] = "email = ?";
                $params[] = $email;
                $types .= "s";
            }
            
            // Add other fields to update
            foreach ($allowedFields as $field => $type) {
                if (isset($data->$field) && $field !== 'email') {
                    $updateFields[] = "$field = ?";
                    $params[] = $conn->real_escape_string($data->$field);
                    $types .= $type;
                }
            }
            
            // Only proceed if there are fields to update
            if (empty($updateFields)) {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "message" => "No fields to update."
                ]);
                exit();
            }
            
            // Complete the query
            $sql = "UPDATE user_management SET " . implode(", ", $updateFields) . " WHERE userID = ?";
            $types .= "i"; // Adding type for the WHERE clause (userID parameter)
            $params[] = $userID; // Adding the userID parameter
            
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Database prepare error: " . $conn->error);
            }
            
            // Bind parameters dynamically
            $stmt->bind_param($types, ...$params);
            
            if ($stmt->execute()) {
                echo json_encode([
                    "success" => true, 
                    "message" => "User updated successfully."
                ]);
            } else {
                throw new Exception("Database error: " . $stmt->error);
            }
            
            $stmt->close();
            break;

        case 'DELETE': // Delete user
            if (!isset($_GET['userID'])) {
                throw new Exception("User ID is required for deletion.");
            }
            
            $userID = $conn->real_escape_string($_GET['userID']);
            
            // Check if user exists
            $stmt = $conn->prepare("SELECT userID FROM user_management WHERE userID = ?");
            $stmt->bind_param("i", $userID);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                http_response_code(404);
                echo json_encode([
                    "success" => false, 
                    "message" => "User not found.",
                    "error" => "user_not_found"
                ]);
                $stmt->close();
                exit();
            }
            $stmt->close();
            
            // Delete the user
            $stmt = $conn->prepare("DELETE FROM user_management WHERE userID = ?");
            if (!$stmt) {
                throw new Exception("Database prepare error: " . $conn->error);
            }
            
            $stmt->bind_param("i", $userID);
            
            if ($stmt->execute()) {
                echo json_encode([
                    "success" => true, 
                    "message" => "User deleted successfully."
                ]);
            } else {
                throw new Exception("Database error: " . $stmt->error);
            }
            
            $stmt->close();
            break;

        default:
            http_response_code(405);
            echo json_encode([
                "success" => false, 
                "message" => "Method not allowed."
            ]);
            break;
    }

    $conn->close();

} catch (Exception $e) {
    error_log("User management error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred. Please try again later.",
        "debug" => $e->getMessage() // Remove this line in production
    ]);
}
?>