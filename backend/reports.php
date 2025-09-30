<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_log("=== Reports.php called ===");

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

    // Set charset
    $conn->set_charset("utf8");

    // Get filter parameters
    $firstName = isset($_GET['firstName']) ? trim($_GET['firstName']) : '';
    $middleName = isset($_GET['middleName']) ? trim($_GET['middleName']) : '';
    $lastName = isset($_GET['lastName']) ? trim($_GET['lastName']) : '';
    $brideName = isset($_GET['brideName']) ? trim($_GET['brideName']) : '';
    $groomName = isset($_GET['groomName']) ? trim($_GET['groomName']) : '';
    $category = isset($_GET['category']) ? trim($_GET['category']) : '';
    $status = isset($_GET['status']) ? trim($_GET['status']) : '';
    $date = isset($_GET['date']) ? trim($_GET['date']) : '';
    $filterType = isset($_GET['filterType']) ? trim($_GET['filterType']) : 'Appointment';

    error_log("Filter Type: $filterType");
    error_log("Filters: firstName=$firstName, lastName=$lastName, category=$category, status=$status, date=$date");

    // Initialize results array
    $filteredResults = [];
    
    // Helper function to format status
    function formatStatus($status) {
        if (empty($status)) return 'Pending';
        $cleanStatus = trim($status);
        $lowerStatus = strtolower($cleanStatus);
        
        if ($lowerStatus === 'pending') return 'Pending';
        elseif ($lowerStatus === 'approved') return 'Approved';
        elseif ($lowerStatus === 'rejected' || $lowerStatus === 'declined') return 'Rejected';
        
        return ucfirst($lowerStatus);
    }

    // ==================== REQUEST CERTIFICATE SECTION ====================
    if ($filterType === 'Request Certificate') {
        error_log("Processing Request Certificate filters");

        // BAPTISM CERTIFICATES
        if (empty($category) || $category === 'Baptism') {
            try {
                $sql = "SELECT 
                            reqbaptismID as id,
                            'Baptism' as category,
                            first_name as firstName,
                            last_name as lastName,
                            DATE_FORMAT(date, '%Y-%m-%d') as dateSubmitted
                        FROM request_baptism
                        WHERE 1=1";
                
                $params = [];
                $types = "";
                
                if (!empty($firstName)) {
                    $sql .= " AND first_name LIKE ?";
                    $params[] = "%$firstName%";
                    $types .= "s";
                }
                if (!empty($lastName)) {
                    $sql .= " AND last_name LIKE ?";
                    $params[] = "%$lastName%";
                    $types .= "s";
                }
                if (!empty($date)) {
                    $sql .= " AND DATE(date) = ?";
                    $params[] = $date;
                    $types .= "s";
                }
                
                $sql .= " ORDER BY date DESC";
                
                if (count($params) > 0) {
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param($types, ...$params);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    while ($row = $result->fetch_assoc()) {
                        $filteredResults[] = $row;
                    }
                    $stmt->close();
                } else {
                    $result = $conn->query($sql);
                    while ($row = $result->fetch_assoc()) {
                        $filteredResults[] = $row;
                    }
                }
                error_log("Baptism certificate results: " . count($filteredResults));
            } catch (Exception $e) {
                error_log("Baptism certificate error: " . $e->getMessage());
            }
        }

        // MARRIAGE CERTIFICATES
        if (empty($category) || $category === 'Marriage') {
            try {
                $sql = "SELECT 
                            reqmarriageID as id,
                            'Marriage' as category,
                            groom_fname as groom_first,
                            groom_lname as groom_last,
                            bride_fname as bride_first,
                            bride_lname as bride_last,
                            DATE_FORMAT(date, '%Y-%m-%d') as dateSubmitted
                        FROM request_marriage
                        WHERE 1=1";
                
                $params = [];
                $types = "";
                $hasFirstNameFilter = false;
                $hasLastNameFilter = false;
                
                if (!empty($firstName)) {
                    $sql .= " AND (groom_fname LIKE ? OR bride_fname LIKE ?)";
                    $params[] = "%$firstName%";
                    $params[] = "%$firstName%";
                    $types .= "ss";
                    $hasFirstNameFilter = true;
                }
                if (!empty($lastName)) {
                    $sql .= " AND (groom_lname LIKE ? OR bride_lname LIKE ?)";
                    $params[] = "%$lastName%";
                    $params[] = "%$lastName%";
                    $types .= "ss";
                    $hasLastNameFilter = true;
                }
                if (!empty($date)) {
                    $sql .= " AND DATE(date) = ?";
                    $params[] = $date;
                    $types .= "s";
                }
                
                $sql .= " ORDER BY date DESC";
                
                if (count($params) > 0) {
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param($types, ...$params);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    while ($row = $result->fetch_assoc()) {
                        // Determine which name matched the search
                        $matchedFirstName = '';
                        $matchedLastName = '';
                        
                        if ($hasFirstNameFilter) {
                            if (stripos($row['groom_first'], $firstName) !== false) {
                                $matchedFirstName = $row['groom_first'];
                                $matchedLastName = $row['groom_last'];
                            } elseif (stripos($row['bride_first'], $firstName) !== false) {
                                $matchedFirstName = $row['bride_first'];
                                $matchedLastName = $row['bride_last'];
                            }
                        } elseif ($hasLastNameFilter) {
                            if (stripos($row['groom_last'], $lastName) !== false) {
                                $matchedFirstName = $row['groom_first'];
                                $matchedLastName = $row['groom_last'];
                            } elseif (stripos($row['bride_last'], $lastName) !== false) {
                                $matchedFirstName = $row['bride_first'];
                                $matchedLastName = $row['bride_last'];
                            }
                        } else {
                            $matchedFirstName = $row['groom_first'];
                            $matchedLastName = $row['groom_last'];
                        }
                        
                        $filteredResults[] = [
                            'id' => $row['id'],
                            'category' => $row['category'],
                            'firstName' => $matchedFirstName,
                            'lastName' => $matchedLastName,
                            'dateSubmitted' => $row['dateSubmitted']
                        ];
                    }
                    $stmt->close();
                } else {
                    $result = $conn->query($sql);
                    while ($row = $result->fetch_assoc()) {
                        $filteredResults[] = [
                            'id' => $row['id'],
                            'category' => $row['category'],
                            'firstName' => $row['groom_first'],
                            'lastName' => $row['groom_last'],
                            'dateSubmitted' => $row['dateSubmitted']
                        ];
                    }
                }
                error_log("Marriage certificate results: " . count($filteredResults));
            } catch (Exception $e) {
                error_log("Marriage certificate error: " . $e->getMessage());
            }
        }

        // COMMUNION CERTIFICATES
        if (empty($category) || $category === 'Communion') {
            try {
                $sql = "SELECT 
                            reqcommunionID as id,
                            'Communion' as category,
                            first_name as firstName,
                            last_name as lastName,
                            DATE_FORMAT(date, '%Y-%m-%d') as dateSubmitted
                        FROM request_communion
                        WHERE 1=1";
                
                $params = [];
                $types = "";
                
                if (!empty($firstName)) {
                    $sql .= " AND first_name LIKE ?";
                    $params[] = "%$firstName%";
                    $types .= "s";
                }
                if (!empty($lastName)) {
                    $sql .= " AND last_name LIKE ?";
                    $params[] = "%$lastName%";
                    $types .= "s";
                }
                if (!empty($date)) {
                    $sql .= " AND DATE(date) = ?";
                    $params[] = $date;
                    $types .= "s";
                }
                
                $sql .= " ORDER BY date DESC";
                
                if (count($params) > 0) {
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param($types, ...$params);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    while ($row = $result->fetch_assoc()) {
                        $filteredResults[] = $row;
                    }
                    $stmt->close();
                } else {
                    $result = $conn->query($sql);
                    while ($row = $result->fetch_assoc()) {
                        $filteredResults[] = $row;
                    }
                }
                error_log("Communion certificate results: " . count($filteredResults));
            } catch (Exception $e) {
                error_log("Communion certificate error: " . $e->getMessage());
            }
        }

        // CONFIRMATION CERTIFICATES
        if (empty($category) || $category === 'Confirmation') {
            try {
                $sql = "SELECT 
                            reqconfirmationID as id,
                            'Confirmation' as category,
                            first_name as firstName,
                            last_name as lastName,
                            DATE_FORMAT(date, '%Y-%m-%d') as dateSubmitted
                        FROM request_confirmation
                        WHERE 1=1";
                
                $params = [];
                $types = "";
                
                if (!empty($firstName)) {
                    $sql .= " AND first_name LIKE ?";
                    $params[] = "%$firstName%";
                    $types .= "s";
                }
                if (!empty($lastName)) {
                    $sql .= " AND last_name LIKE ?";
                    $params[] = "%$lastName%";
                    $types .= "s";
                }
                if (!empty($date)) {
                    $sql .= " AND DATE(date) = ?";
                    $params[] = $date;
                    $types .= "s";
                }
                
                $sql .= " ORDER BY date DESC";
                
                if (count($params) > 0) {
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param($types, ...$params);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    while ($row = $result->fetch_assoc()) {
                        $filteredResults[] = $row;
                    }
                    $stmt->close();
                } else {
                    $result = $conn->query($sql);
                    while ($row = $result->fetch_assoc()) {
                        $filteredResults[] = $row;
                    }
                }
                error_log("Confirmation certificate results: " . count($filteredResults));
            } catch (Exception $e) {
                error_log("Confirmation certificate error: " . $e->getMessage());
            }
        }

        usort($filteredResults, function($a, $b) {
            return strtotime($b['dateSubmitted']) - strtotime($a['dateSubmitted']);
        });

        error_log("Total certificate results: " . count($filteredResults));

        $conn->close();

        echo json_encode([
            "success" => true,
            "certificates" => $filteredResults,
            "total_count" => count($filteredResults)
        ]);
        exit();
    }

    // ==================== EVENTS SECTION ====================
    if ($filterType === 'Event') {
        error_log("Processing Event filters");

        try {
            $sql = "SELECT 
                        activityID as id,
                        title,
                        organizer,
                        nameOfParish,
                        location,
                        DATE_FORMAT(startDate, '%Y-%m-%d') as date,
                        startTime as time
                    FROM activity
                    WHERE 1=1";
            
            $params = [];
            $types = "";
            
            if (!empty($_GET['eventTitle'])) {
                $eventTitle = trim($_GET['eventTitle']);
                $sql .= " AND title LIKE ?";
                $params[] = "%$eventTitle%";
                $types .= "s";
            }
            if (!empty($_GET['organizer'])) {
                $organizer = trim($_GET['organizer']);
                $sql .= " AND organizer LIKE ?";
                $params[] = "%$organizer%";
                $types .= "s";
            }
            if (!empty($_GET['parishName'])) {
                $parishName = trim($_GET['parishName']);
                $sql .= " AND nameOfParish LIKE ?";
                $params[] = "%$parishName%";
                $types .= "s";
            }
            if (!empty($_GET['location'])) {
                $location = trim($_GET['location']);
                $sql .= " AND location LIKE ?";
                $params[] = "%$location%";
                $types .= "s";
            }
            if (!empty($date)) {
                $sql .= " AND DATE(startDate) = ?";
                $params[] = $date;
                $types .= "s";
            }
            
            $sql .= " ORDER BY startDate DESC";
            
            if (count($params) > 0) {
                $stmt = $conn->prepare($sql);
                $stmt->bind_param($types, ...$params);
                $stmt->execute();
                $result = $stmt->get_result();
                while ($row = $result->fetch_assoc()) {
                    $filteredResults[] = $row;
                }
                $stmt->close();
            } else {
                $result = $conn->query($sql);
                while ($row = $result->fetch_assoc()) {
                    $filteredResults[] = $row;
                }
            }
            error_log("Event results: " . count($filteredResults));
        } catch (Exception $e) {
            error_log("Event error: " . $e->getMessage());
        }

        $conn->close();

        echo json_encode([
            "success" => true,
            "events" => $filteredResults,
            "total_count" => count($filteredResults)
        ]);
        exit();
    }

    // ==================== DONATION SECTION ====================
    if ($filterType === 'Donation') {
        error_log("Processing Donation filters");

        try {
            $sql = "SELECT 
                        donationID as id,
                        full_name as name,
                        donation_amount as amount,
                        purpose,
                        intention,
                        DATE_FORMAT(date_of_donation, '%Y-%m-%d') as dateOfDonation
                    FROM donations
                    WHERE 1=1";
            
            $params = [];
            $types = "";
            
            if (!empty($_GET['donorName'])) {
                $donorName = trim($_GET['donorName']);
                $sql .= " AND full_name LIKE ?";
                $params[] = "%$donorName%";
                $types .= "s";
            }
            if (!empty($_GET['purpose'])) {
                $purpose = trim($_GET['purpose']);
                $sql .= " AND LOWER(purpose) = LOWER(?)";
                $params[] = $purpose;
                $types .= "s";
            }
            if (!empty($_GET['intention'])) {
                $intention = trim($_GET['intention']);
                $sql .= " AND LOWER(intention) = LOWER(?)";
                $params[] = $intention;
                $types .= "s";
            }
            if (!empty($_GET['amount'])) {
                $amount = trim($_GET['amount']);
                $sql .= " AND donation_amount = ?";
                $params[] = $amount;
                $types .= "d";
            }
            if (!empty($date)) {
                $sql .= " AND DATE(date_of_donation) = ?";
                $params[] = $date;
                $types .= "s";
            }
            
            $sql .= " ORDER BY date_of_donation DESC";
            
            if (count($params) > 0) {
                $stmt = $conn->prepare($sql);
                $stmt->bind_param($types, ...$params);
                $stmt->execute();
                $result = $stmt->get_result();
                while ($row = $result->fetch_assoc()) {
                    $filteredResults[] = $row;
                }
                $stmt->close();
            } else {
                $result = $conn->query($sql);
                while ($row = $result->fetch_assoc()) {
                    $filteredResults[] = $row;
                }
            }
            error_log("Donation results: " . count($filteredResults));
        } catch (Exception $e) {
            error_log("Donation error: " . $e->getMessage());
        }

        $conn->close();

        echo json_encode([
            "success" => true,
            "donations" => $filteredResults,
            "total_count" => count($filteredResults)
        ]);
        exit();
    }

    // ==================== EXPENSES SECTION ====================
    if ($filterType === 'Expenses') {
        error_log("Processing Expenses filters");

        try {
            $sql = "SELECT 
                        reportID,
                        expenseName,
                        category,
                        amount,
                        DATE_FORMAT(dateOfExpense, '%Y-%m-%d') as dateOfExpense,
                        description
                    FROM report
                    WHERE 1=1";
            
            $params = [];
            $types = "";
            
            if (!empty($category)) {
                $sql .= " AND category = ?";
                $params[] = $category;
                $types .= "s";
            }
            if (!empty($_GET['expenseName'])) {
                $expenseName = trim($_GET['expenseName']);
                $sql .= " AND expenseName = ?";
                $params[] = $expenseName;
                $types .= "s";
            }
            if (!empty($_GET['amount'])) {
                $amount = trim($_GET['amount']);
                $sql .= " AND amount = ?";
                $params[] = $amount;
                $types .= "d";
            }
            if (!empty($date)) {
                $sql .= " AND DATE(dateOfExpense) = ?";
                $params[] = $date;
                $types .= "s";
            }
            
            $sql .= " ORDER BY dateOfExpense DESC";
            
            if (count($params) > 0) {
                $stmt = $conn->prepare($sql);
                $stmt->bind_param($types, ...$params);
                $stmt->execute();
                $result = $stmt->get_result();
                while ($row = $result->fetch_assoc()) {
                    $filteredResults[] = $row;
                }
                $stmt->close();
            } else {
                $result = $conn->query($sql);
                while ($row = $result->fetch_assoc()) {
                    $filteredResults[] = $row;
                }
            }
            error_log("Expense results: " . count($filteredResults));
        } catch (Exception $e) {
            error_log("Expense error: " . $e->getMessage());
        }

        $conn->close();

        echo json_encode([
            "success" => true,
            "expenses" => $filteredResults,
            "total_count" => count($filteredResults)
        ]);
        exit();
    }

    // ==================== APPOINTMENT SECTION ====================
    if ($filterType === 'Appointment') {
        // BAPTISM APPOINTMENTS
        if (empty($category) || $category === 'Baptism') {
            try {
                $sql = "SELECT 
                            baptismID as id,
                            firstName,
                            middleName,
                            lastName,
                            'Baptism' as category,
                            dateOfBaptism as date,
                            timeOfBaptism as time,
                            status,
                            DATE(created_at) as createdAt
                        FROM baptism_application
                        WHERE 1=1";
                
                $params = [];
                $types = "";
                
                if (!empty($firstName)) {
                    $sql .= " AND firstName LIKE ?";
                    $params[] = "%$firstName%";
                    $types .= "s";
                }
                if (!empty($middleName)) {
                    $sql .= " AND middleName LIKE ?";
                    $params[] = "%$middleName%";
                    $types .= "s";
                }
                if (!empty($lastName)) {
                    $sql .= " AND lastName LIKE ?";
                    $params[] = "%$lastName%";
                    $types .= "s";
                }
                if (!empty($status)) {
                    $sql .= " AND LOWER(TRIM(status)) = LOWER(?)";
                    $params[] = $status;
                    $types .= "s";
                }
                if (!empty($date)) {
                    $sql .= " AND DATE(dateOfBaptism) = ?";
                    $params[] = $date;
                    $types .= "s";
                }
                
                $sql .= " ORDER BY dateOfBaptism ASC";
                
                if (count($params) > 0) {
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param($types, ...$params);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    while ($row = $result->fetch_assoc()) {
                        $row['status'] = formatStatus($row['status']);
                        $filteredResults[] = $row;
                    }
                    $stmt->close();
                } else {
                    $result = $conn->query($sql);
                    while ($row = $result->fetch_assoc()) {
                        $row['status'] = formatStatus($row['status']);
                        $filteredResults[] = $row;
                    }
                }
                error_log("Baptism results: " . count($filteredResults));
            } catch (Exception $e) {
                error_log("Baptism error: " . $e->getMessage());
            }
        }

        // MARRIAGE APPOINTMENTS
        if (empty($category) || $category === 'Marriage') {
            try {
                $sql = "SELECT 
                            marriageID as id,
                            CONCAT(COALESCE(groom_first_name, ''), ' ', COALESCE(groom_last_name, '')) as groomName,
                            CONCAT(COALESCE(bride_first_name, ''), ' ', COALESCE(bride_last_name, '')) as brideName,
                            'Marriage' as category,
                            date,
                            time,
                            status,
                            DATE(created_at) as createdAt
                        FROM marriage_application
                        WHERE 1=1";
                
                $params = [];
                $types = "";
                
                if (!empty($groomName)) {
                    $sql .= " AND (groom_first_name LIKE ? OR groom_last_name LIKE ?)";
                    $params[] = "%$groomName%";
                    $params[] = "%$groomName%";
                    $types .= "ss";
                }
                if (!empty($brideName)) {
                    $sql .= " AND (bride_first_name LIKE ? OR bride_last_name LIKE ?)";
                    $params[] = "%$brideName%";
                    $params[] = "%$brideName%";
                    $types .= "ss";
                }
                if (!empty($status)) {
                    $sql .= " AND LOWER(TRIM(status)) = LOWER(?)";
                    $params[] = $status;
                    $types .= "s";
                }
                if (!empty($date)) {
                    $sql .= " AND DATE(date) = ?";
                    $params[] = $date;
                    $types .= "s";
                }
                
                $sql .= " ORDER BY date ASC";
                
                if (count($params) > 0) {
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param($types, ...$params);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    while ($row = $result->fetch_assoc()) {
                        $row['status'] = formatStatus($row['status']);
                        $filteredResults[] = $row;
                    }
                    $stmt->close();
                } else {
                    $result = $conn->query($sql);
                    while ($row = $result->fetch_assoc()) {
                        $row['status'] = formatStatus($row['status']);
                        $filteredResults[] = $row;
                    }
                }
                error_log("Marriage results: " . count($filteredResults));
            } catch (Exception $e) {
                error_log("Marriage error: " . $e->getMessage());
            }
        }

        // FUNERAL MASS APPOINTMENTS
        if (empty($category) || $category === 'Funeral Mass') {
            try {
                $sql = "SELECT 
                            f.funeralID as id,
                            COALESCE(d.first_name, '') as firstName,
                            COALESCE(d.middle_name, '') as middleName,
                            COALESCE(d.last_name, '') as lastName,
                            'Funeral Mass' as category,
                            f.dateOfFuneralMass as date,
                            f.timeOfFuneralMass as time,
                            f.status,
                            DATE(f.created_at) as createdAt
                        FROM funeral_mass_application f
                        LEFT JOIN deceased_info d ON f.funeralID = d.funeralID
                        WHERE 1=1";
                
                $params = [];
                $types = "";
                
                if (!empty($firstName)) {
                    $sql .= " AND d.first_name LIKE ?";
                    $params[] = "%$firstName%";
                    $types .= "s";
                }
                if (!empty($middleName)) {
                    $sql .= " AND d.middle_name LIKE ?";
                    $params[] = "%$middleName%";
                    $types .= "s";
                }
                if (!empty($lastName)) {
                    $sql .= " AND d.last_name LIKE ?";
                    $params[] = "%$lastName%";
                    $types .= "s";
                }
                if (!empty($status)) {
                    $sql .= " AND LOWER(TRIM(f.status)) = LOWER(?)";
                    $params[] = $status;
                    $types .= "s";
                }
                if (!empty($date)) {
                    $sql .= " AND DATE(f.dateOfFuneralMass) = ?";
                    $params[] = $date;
                    $types .= "s";
                }
                
                $sql .= " ORDER BY f.dateOfFuneralMass ASC";
                
                if (count($params) > 0) {
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param($types, ...$params);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    while ($row = $result->fetch_assoc()) {
                        $row['status'] = formatStatus($row['status']);
                        $filteredResults[] = $row;
                    }
                    $stmt->close();
                } else {
                    $result = $conn->query($sql);
                    while ($row = $result->fetch_assoc()) {
                        $row['status'] = formatStatus($row['status']);
                        $filteredResults[] = $row;
                    }
                }
            } catch (Exception $e) {
                error_log("Funeral error: " . $e->getMessage());
            }
        }

        // BLESSING APPOINTMENTS
        if (empty($category) || $category === 'Blessing') {
            try {
                $sql = "SELECT 
                            blessingID as id,
                            firstName,
                            '' as middleName,
                            lastName,
                            'Blessing' as category,
                            preferredDate as date,
                            preferredTime as time,
                            status,
                            DATE(dateCreated) as createdAt
                        FROM blessing_application
                        WHERE 1=1";
                
                $params = [];
                $types = "";
                
                if (!empty($firstName)) {
                    $sql .= " AND firstName LIKE ?";
                    $params[] = "%$firstName%";
                    $types .= "s";
                }
                if (!empty($lastName)) {
                    $sql .= " AND lastName LIKE ?";
                    $params[] = "%$lastName%";
                    $types .= "s";
                }
                if (!empty($status)) {
                    $sql .= " AND LOWER(TRIM(status)) = LOWER(?)";
                    $params[] = $status;
                    $types .= "s";
                }
                if (!empty($date)) {
                    $sql .= " AND DATE(preferredDate) = ?";
                    $params[] = $date;
                    $types .= "s";
                }
                
                $sql .= " ORDER BY preferredDate ASC";
                
                if (count($params) > 0) {
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param($types, ...$params);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    while ($row = $result->fetch_assoc()) {
                        $row['status'] = formatStatus($row['status']);
                        $filteredResults[] = $row;
                    }
                    $stmt->close();
                } else {
                    $result = $conn->query($sql);
                    while ($row = $result->fetch_assoc()) {
                        $row['status'] = formatStatus($row['status']);
                        $filteredResults[] = $row;
                    }
                }
            } catch (Exception $e) {
                error_log("Blessing error: " . $e->getMessage());
            }
        }

        // COMMUNION APPOINTMENTS
        if (empty($category) || $category === 'Communion') {
            try {
                $sql = "SELECT 
                            communionID as id,
                            first_name as firstName,
                            middle_name as middleName,
                            last_name as lastName,
                            'Communion' as category,
                            date,
                            time,
                            status,
                            DATE(created_at) as createdAt
                        FROM communion_application
                        WHERE 1=1";
                
                $params = [];
                $types = "";
                
                if (!empty($firstName)) {
                    $sql .= " AND first_name LIKE ?";
                    $params[] = "%$firstName%";
                    $types .= "s";
                }
                if (!empty($middleName)) {
                    $sql .= " AND middle_name LIKE ?";
                    $params[] = "%$middleName%";
                    $types .= "s";
                }
                if (!empty($lastName)) {
                    $sql .= " AND last_name LIKE ?";
                    $params[] = "%$lastName%";
                    $types .= "s";
                }
                if (!empty($status)) {
                    $sql .= " AND LOWER(TRIM(status)) = LOWER(?)";
                    $params[] = $status;
                    $types .= "s";
                }
                if (!empty($date)) {
                    $sql .= " AND DATE(date) = ?";
                    $params[] = $date;
                    $types .= "s";
                }
                
                $sql .= " ORDER BY date ASC";
                
                if (count($params) > 0) {
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param($types, ...$params);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    while ($row = $result->fetch_assoc()) {
                        $row['status'] = formatStatus($row['status']);
                        $filteredResults[] = $row;
                    }
                    $stmt->close();
                } else {
                    $result = $conn->query($sql);
                    while ($row = $result->fetch_assoc()) {
                        $row['status'] = formatStatus($row['status']);
                        $filteredResults[] = $row;
                    }
                }
            } catch (Exception $e) {
                error_log("Communion error: " . $e->getMessage());
            }
        }

        // CONFIRMATION APPOINTMENTS
        if (empty($category) || $category === 'Confirmation') {
            try {
                $sql = "SELECT 
                            confirmationID as id,
                            first_name as firstName,
                            middle_name as middleName,
                            last_name as lastName,
                            'Confirmation' as category,
                            date,
                            time,
                            status,
                            DATE(created_at) as createdAt
                        FROM confirmation_application
                        WHERE 1=1";
                
                $params = [];
                $types = "";
                
                if (!empty($firstName)) {
                    $sql .= " AND first_name LIKE ?";
                    $params[] = "%$firstName%";
                    $types .= "s";
                }
                if (!empty($middleName)) {
                    $sql .= " AND middle_name LIKE ?";
                    $params[] = "%$middleName%";
                    $types .= "s";
                }
                if (!empty($lastName)) {
                    $sql .= " AND last_name LIKE ?";
                    $params[] = "%$lastName%";
                    $types .= "s";
                }
                if (!empty($status)) {
                    $sql .= " AND LOWER(TRIM(status)) = LOWER(?)";
                    $params[] = $status;
                    $types .= "s";
                }
                if (!empty($date)) {
                    $sql .= " AND DATE(date) = ?";
                    $params[] = $date;
                    $types .= "s";
                }
                
                $sql .= " ORDER BY date ASC";
                
                if (count($params) > 0) {
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param($types, ...$params);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    while ($row = $result->fetch_assoc()) {
                        $row['status'] = formatStatus($row['status']);
                        $filteredResults[] = $row;
                    }
                    $stmt->close();
                } else {
                    $result = $conn->query($sql);
                    while ($row = $result->fetch_assoc()) {
                        $row['status'] = formatStatus($row['status']);
                        $filteredResults[] = $row;
                    }
                }
            } catch (Exception $e) {
                error_log("Confirmation error: " . $e->getMessage());
            }
        }

        // ANOINTING APPOINTMENTS
        if (empty($category) || $category === 'Anointing of the Sick') {
            try {
                $sql = "SELECT 
                            anointingID as id,
                            firstName,
                            '' as middleName,
                            lastName,
                            'Anointing of the Sick' as category,
                            dateOfAnointing as date,
                            timeOfAnointing as time,
                            status,
                            DATE(dateCreated) as createdAt
                        FROM anointing_application
                        WHERE 1=1";
                
                $params = [];
                $types = "";
                
                if (!empty($firstName)) {
                    $sql .= " AND firstName LIKE ?";
                    $params[] = "%$firstName%";
                    $types .= "s";
                }
                if (!empty($lastName)) {
                    $sql .= " AND lastName LIKE ?";
                    $params[] = "%$lastName%";
                    $types .= "s";
                }
                if (!empty($status)) {
                    $sql .= " AND LOWER(TRIM(status)) = LOWER(?)";
                    $params[] = $status;
                    $types .= "s";
                }
                if (!empty($date)) {
                    $sql .= " AND DATE(dateOfAnointing) = ?";
                    $params[] = $date;
                    $types .= "s";
                }
                
                $sql .= " ORDER BY dateOfAnointing ASC";
                
                if (count($params) > 0) {
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param($types, ...$params);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    while ($row = $result->fetch_assoc()) {
                        $row['status'] = formatStatus($row['status']);
                        $filteredResults[] = $row;
                    }
                    $stmt->close();
                } else {
                    $result = $conn->query($sql);
                    while ($row = $result->fetch_assoc()) {
                        $row['status'] = formatStatus($row['status']);
                        $filteredResults[] = $row;
                    }
                }
            } catch (Exception $e) {
                error_log("Anointing error: " . $e->getMessage());
            }
        }

        usort($filteredResults, function($a, $b) {
            return strtotime($a['date']) - strtotime($b['date']);
        });

        error_log("Total appointment results: " . count($filteredResults));

        $conn->close();

        echo json_encode([
            "success" => true,
            "appointments" => $filteredResults,
            "total_count" => count($filteredResults)
        ]);
        exit();
    }

    // If no valid filterType
    throw new Exception("Invalid filter type");

} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>