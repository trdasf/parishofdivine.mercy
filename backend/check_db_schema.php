<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost";
$username = "u572625467_divine_mercy";
$password = "Parish_12345";
$dbname = "u572625467_parish";
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "DB connection failed: " . $conn->connect_error]));
}

$result = $conn->query("DESCRIBE communion_application");
$fields = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $fields[] = [
            'field' => $row['Field'],
            'type' => $row['Type'],
            'null' => $row['Null'],
            'key' => $row['Key'],
            'default' => $row['Default'],
            'extra' => $row['Extra']
        ];
    }
    echo json_encode(["success" => true, "schema" => $fields]);
} else {
    echo json_encode(["success" => false, "message" => "No table structure found"]);
}

$conn->close();
?> 