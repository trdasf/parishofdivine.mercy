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

    // Check if marriageID is provided
    if (!isset($_GET['marriageID']) || empty($_GET['marriageID'])) {
        throw new Exception("Marriage ID is required");
    }

    $marriageID = $_GET['marriageID'];
    
    // Start transaction
    $conn->begin_transaction();

    try {
        // 1. Fetch marriage application data
        $sql = "SELECT * FROM marriage_application WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $marriageResult = $stmt->get_result();
        $marriage = $marriageResult->fetch_assoc();
        $stmt->close();
        
        if (!$marriage) {
            throw new Exception("Marriage record not found");
        }

        // 2. Fetch groom's address
        $sql = "SELECT * FROM marriage_groom_address WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $groomAddressResult = $stmt->get_result();
        $groomAddress = $groomAddressResult->fetch_assoc();
        $stmt->close();

        // 3. Fetch bride's address
        $sql = "SELECT * FROM marriage_bride_address WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $brideAddressResult = $stmt->get_result();
        $brideAddress = $brideAddressResult->fetch_assoc();
        $stmt->close();

        // 4. Fetch first witness
        $sql = "SELECT * FROM marriage_first_witness WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $firstWitnessResult = $stmt->get_result();
        $firstWitness = $firstWitnessResult->fetch_assoc();
        $stmt->close();

        // 5. Fetch first witness address
        $sql = "SELECT * FROM marriage_first_witness_address WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $firstWitnessAddressResult = $stmt->get_result();
        $firstWitnessAddress = $firstWitnessAddressResult->fetch_assoc();
        $stmt->close();

        // 6. Fetch second witness
        $sql = "SELECT * FROM marriage_second_witness WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $secondWitnessResult = $stmt->get_result();
        $secondWitness = $secondWitnessResult->fetch_assoc();
        $stmt->close();

        // 7. Fetch second witness address
        $sql = "SELECT * FROM marriage_second_witness_address WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $secondWitnessAddressResult = $stmt->get_result();
        $secondWitnessAddress = $secondWitnessAddressResult->fetch_assoc();
        $stmt->close();

        // 8. Fetch requirements
        $sql = "SELECT * FROM marriage_requirement WHERE marriageID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $marriageID);
        $stmt->execute();
        $requirementsResult = $stmt->get_result();
        $requirements = $requirementsResult->fetch_assoc();
        $stmt->close();

        // Commit transaction
        $conn->commit();

        // Transform data to match the React component's expected structure
        $transformedData = [
            'marriageID' => $marriage['marriageID'],
            'date' => $marriage['date'],
            'time' => $marriage['time'],
            'priest' => $marriage['priest_name'],
            'status' => $marriage['status'],
            
            // Groom information
            'groom' => [
                'firstName' => $marriage['groom_first_name'],
                'middleName' => $marriage['groom_middle_name'],
                'lastName' => $marriage['groom_last_name'],
                'age' => $marriage['groom_age'],
                'dateOfBirth' => $marriage['groom_birthdate'],
                'placeOfBirth' => $marriage['groom_birthplace'],
                'dateOfBaptism' => $marriage['groom_baptism_date'],
                'churchOfBaptism' => $marriage['groom_baptism_church'],
                'address' => [
                    'street' => $groomAddress['street'] ?? 'N/A',
                    'barangay' => $groomAddress['barangay'] ?? 'N/A',
                    'municipality' => $groomAddress['municipality'] ?? 'N/A',
                    'province' => $groomAddress['province'] ?? 'N/A',
                    'region' => $groomAddress['region'] ?? 'N/A'
                ]
            ],
            
            // Bride information
            'bride' => [
                'firstName' => $marriage['bride_first_name'],
                'middleName' => $marriage['bride_middle_name'],
                'lastName' => $marriage['bride_last_name'],
                'age' => $marriage['bride_age'],
                'dateOfBirth' => $marriage['bride_birthdate'],
                'placeOfBirth' => $marriage['bride_birthplace'],
                'dateOfBaptism' => $marriage['bride_baptism_date'],
                'churchOfBaptism' => $marriage['bride_baptism_church'],
                'address' => [
                    'street' => $brideAddress['street'] ?? 'N/A',
                    'barangay' => $brideAddress['barangay'] ?? 'N/A',
                    'municipality' => $brideAddress['municipality'] ?? 'N/A',
                    'province' => $brideAddress['province'] ?? 'N/A',
                    'region' => $brideAddress['region'] ?? 'N/A'
                ]
            ],
            
            // Witnesses information
            'witnesses' => [
                [
                    'firstName' => $firstWitness['first_name'] ?? 'N/A',
                    'middleName' => $firstWitness['middle_name'] ?? 'N/A',
                    'lastName' => $firstWitness['last_name'] ?? 'N/A',
                    'gender' => $firstWitness['gender'] ?? 'N/A',
                    'age' => $firstWitness['age'] ?? 'N/A',
                    'dateOfBirth' => $firstWitness['birthdate'] ?? 'N/A',
                    'contact' => $firstWitness['contact'] ?? 'N/A',
                    'address' => [
                        'street' => $firstWitnessAddress['street'] ?? 'N/A',
                        'barangay' => $firstWitnessAddress['barangay'] ?? 'N/A',
                        'municipality' => $firstWitnessAddress['municipality'] ?? 'N/A',
                        'province' => $firstWitnessAddress['province'] ?? 'N/A',
                        'region' => $firstWitnessAddress['region'] ?? 'N/A'
                    ]
                ],
                [
                    'firstName' => $secondWitness['first_name'] ?? 'N/A',
                    'middleName' => $secondWitness['middle_name'] ?? 'N/A',
                    'lastName' => $secondWitness['last_name'] ?? 'N/A',
                    'gender' => $secondWitness['gender'] ?? 'N/A',
                    'age' => $secondWitness['age'] ?? 'N/A',
                    'dateOfBirth' => $secondWitness['birthdate'] ?? 'N/A',
                    'contact' => $secondWitness['contact'] ?? 'N/A',
                    'address' => [
                        'street' => $secondWitnessAddress['street'] ?? 'N/A',
                        'barangay' => $secondWitnessAddress['barangay'] ?? 'N/A',
                        'municipality' => $secondWitnessAddress['municipality'] ?? 'N/A',
                        'province' => $secondWitnessAddress['province'] ?? 'N/A',
                        'region' => $secondWitnessAddress['region'] ?? 'N/A'
                    ]
                ]
            ],
            
            // Requirements
            'requirements' => [
                'baptismalCert' => [
                    'submitted' => $requirements['baptismal_cert_status'] === 'Submitted',
                    'fileName' => $requirements['baptismal_cert'] ? basename($requirements['baptismal_cert']) : 'N/A'
                ],
                'confirmationCert' => [
                    'submitted' => $requirements['confirmation_cert_status'] === 'Submitted',
                    'fileName' => $requirements['confirmation_cert'] ? basename($requirements['confirmation_cert']) : 'N/A'
                ],
                'birthCert' => [
                    'submitted' => $requirements['birth_cert_status'] === 'Submitted',
                    'fileName' => $requirements['birth_cert'] ? basename($requirements['birth_cert']) : 'N/A'
                ],
                'marriageLicense' => [
                    'submitted' => $requirements['marriage_license_status'] === 'Submitted',
                    'fileName' => $requirements['marriage_license'] ? basename($requirements['marriage_license']) : 'N/A'
                ],
                'cenomar' => [
                    'submitted' => $requirements['cenomar_status'] === 'Submitted',
                    'fileName' => $requirements['cenomar'] ? basename($requirements['cenomar']) : 'N/A'
                ],
                'publicationBanns' => [
                    'submitted' => $requirements['publication_banns_status'] === 'Submitted',
                    'fileName' => $requirements['publication_banns'] ? basename($requirements['publication_banns']) : 'N/A'
                ],
                'permitFromParish' => [
                    'submitted' => $requirements['parish_permit_status'] === 'Submitted',
                    'fileName' => $requirements['parish_permit'] ? basename($requirements['parish_permit']) : 'N/A'
                ],
                'preCana' => [
                    'submitted' => $requirements['pre_cana_status'] === 'Submitted',
                    'fileName' => $requirements['pre_cana'] ? basename($requirements['pre_cana']) : 'N/A'
                ],
                'sponsorsList' => [
                    'submitted' => $requirements['sponsors_list_status'] === 'Submitted',
                    'fileName' => $requirements['sponsors_list'] ? basename($requirements['sponsors_list']) : 'N/A'
                ],
                'weddingPractice' => [
                    'submitted' => $requirements['wedding_practice_status'] === 'Submitted',
                    'fileName' => $requirements['wedding_practice'] ? basename($requirements['wedding_practice']) : 'N/A'
                ],
                'canonicalInterview' => [
                    'submitted' => $requirements['canonical_interview_status'] === 'Submitted',
                    'fileName' => $requirements['canonical_interview'] ? basename($requirements['canonical_interview']) : 'N/A'
                ]
            ],
            
            // Certificate data (for generating certificate)
            'certificate' => [
                'registry' => [
                    'registryNo' => sprintf('%04d', $marriage['marriageID']),
                    'province' => 'Camarines Norte',
                    'city' => 'Daet'
                ],
                'solemnizer' => [
                    'name' => $marriage['priest_name'] ?? 'Rev. Fr. John Doe',
                    'position' => 'Parish Priest'
                ],
                'dateIssued' => date('Y-m-d')
            ]
        ];

        echo json_encode([
            "success" => true,
            "data" => $transformedData
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