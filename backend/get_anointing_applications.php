<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

// Get client-specific applications if clientID is provided
$clientID = isset($_GET['clientID']) ? intval($_GET['clientID']) : null;
$whereClause = $clientID ? "WHERE a.clientID = $clientID" : "";

// Build the query with JOINs for all tables
$sql = "
    SELECT 
        a.*,
        c.contactFirstName, c.contactMiddleName, c.contactLastName, 
        c.contactRelationship, c.contactPhone, c.contactEmail,
        l.locationType, l.locationName, l.roomNumber, l.street, l.barangay, 
        l.municipality, l.province, l.locationRegion,
        ai.isCritical, ai.needsViaticum, ai.needsReconciliation, ai.additionalNotes,
        r.medical_cert, r.medical_cert_status, r.valid_ids, r.valid_ids_status
    FROM 
        anointing_application a
    LEFT JOIN 
        anointing_contactinfo c ON a.anointingID = c.anointingID
    LEFT JOIN 
        anointing_location l ON a.anointingID = l.anointingID
    LEFT JOIN 
        anointing_additionalinfo ai ON a.anointingID = ai.anointingID
    LEFT JOIN 
        anointing_requirement r ON a.anointingID = r.anointingID
    $whereClause
    ORDER BY 
        a.dateOfAnointing DESC, a.timeOfAnointing ASC
";

$result = $conn->query($sql);

if ($result !== false) {
    $applications = [];
    
    while ($row = $result->fetch_assoc()) {
        // Format boolean fields
        $row['isCritical'] = (bool)$row['isCritical'];
        $row['needsViaticum'] = (bool)$row['needsViaticum'];
        $row['needsReconciliation'] = (bool)$row['needsReconciliation'];
        
        $applications[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "applications" => $applications
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Error fetching applications: " . $conn->error
    ]);
}

$conn->close(); 