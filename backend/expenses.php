<?php
// Disable HTML error reporting and enable JSON error responses
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set JSON header at the very beginning
header("Content-Type: application/json; charset=UTF-8");

try {
    // Start session
    session_start();

    // CORS headers
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
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

    // Handle GET request - Fetch expense reports
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get filter parameters from query (optional)
        $categoryFilter = isset($_GET['category']) ? $_GET['category'] : null;
        $subCategoryFilter = isset($_GET['subCategory']) ? $_GET['subCategory'] : null;
        $monthFilter = isset($_GET['month']) ? $_GET['month'] : null;
        $yearFilter = isset($_GET['year']) ? $_GET['year'] : null;
        
        // Build the base query
        $sql = "SELECT * FROM report";
        
        // Prepare WHERE clauses array
        $whereConditions = [];
        $params = [];
        $types = "";
        
        // Add category filter if provided
        if ($categoryFilter) {
            $whereConditions[] = "category = ?";
            $params[] = $categoryFilter;
            $types .= "s";
        }
        

        
        // Add date filters if provided (using LIKE because dateOfExpense is VARCHAR)
        if ($monthFilter && $yearFilter) {
            // Format: YYYY-MM
            $datePattern = $yearFilter . '-' . sprintf("%02d", $monthFilter) . '%';
            $whereConditions[] = "dateOfExpense LIKE ?";
            $params[] = $datePattern;
            $types .= "s";
        } elseif ($yearFilter) {
            // Just filter by year
            $datePattern = $yearFilter . '-%';
            $whereConditions[] = "dateOfExpense LIKE ?";
            $params[] = $datePattern;
            $types .= "s";
        } elseif ($monthFilter) {
            // Just filter by month (any year) - more specific for yyyy-mm-dd format
            $monthPattern = '-' . sprintf("%02d", $monthFilter) . '-';
            $whereConditions[] = "dateOfExpense LIKE ?";
            $params[] = '%' . $monthPattern . '%';
            $types .= "s";
        }
        
        // Combine WHERE clauses if any
        if (count($whereConditions) > 0) {
            $sql .= " WHERE " . implode(" AND ", $whereConditions);
        }
        
        // Order by most recent first
        $sql .= " ORDER BY reportID DESC";
        
        // Prepare and execute the statement
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        // Bind parameters if any
        if (count($params) > 0) {
            $stmt->bind_param($types, ...$params);
        }
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $reports = [];
        $totalExpenses = 0;
        
        while ($row = $result->fetch_assoc()) {
            $reports[] = $row;
            // Use amount field for total calculation since we're not using quantity
            $totalExpenses += $row['amount'];
        }
        
        // Get unique years from the database for the filter dropdown
        $yearQuery = "SELECT DISTINCT SUBSTRING(dateOfExpense, 1, 4) as year FROM report ORDER BY year DESC";
        $yearResult = $conn->query($yearQuery);
        
        if (!$yearResult) {
            throw new Exception("Error fetching years: " . $conn->error);
        }
        
        $years = [];
        while ($yearRow = $yearResult->fetch_assoc()) {
            $years[] = $yearRow['year'];
        }
        
        $stmt->close();
        
        echo json_encode([
            "success" => true,
            "reports" => $reports,
            "totalExpenses" => $totalExpenses,
            "availableYears" => $years
        ]);
    }
    
    // Handle POST request - Create a new expense report
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Read and decode JSON data from the request
        $json = file_get_contents("php://input");
        $data = json_decode($json);
        
        // Check if JSON parsing failed
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON: " . json_last_error_msg());
        }
        
        // Validate received data
        if (!$data || !isset($data->expenseName, $data->category, $data->amount)) {
            throw new Exception("Missing required fields for expense report.");
        }
        
        // Since we're not using quantity, set it to 1 and totalCost = amount
        $quantity = 1;
        $totalCost = $data->amount;
        
        // Format date of expense
        $dateOfExpense = isset($data->dateOfExpense) ? $data->dateOfExpense : date('Y-m-d');
        
        // Handle subcategory (can be null)
        $subCategory = isset($data->subCategory) ? $data->subCategory : null;
        
        // Prepare and bind parameters
        $stmt = $conn->prepare("INSERT INTO report (expenseName, category, amount, quantity, totalCost, 
                                dateOfExpense, description) 
                                VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("ssdidss", 
            $data->expenseName,
            $data->category,
            $data->amount,
            $quantity,
            $totalCost,
            $dateOfExpense,
            $data->description
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $newReportId = $stmt->insert_id;
        $stmt->close();
        
        echo json_encode([
            "success" => true,
            "message" => "Expense report created successfully",
            "reportID" => $newReportId
        ]);
    }
    
    // Handle PUT request - Update an expense report
    elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Read and decode JSON data from the request
        $json = file_get_contents("php://input");
        $data = json_decode($json);
        
        // Check if JSON parsing failed
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON: " . json_last_error_msg());
        }
        
        // Validate received data
        if (!$data || !isset($data->reportID, $data->expenseName, $data->category, $data->amount)) {
            throw new Exception("Missing required fields for updating expense report.");
        }
        
        // Since we're not using quantity, set it to 1 and totalCost = amount
        $quantity = 1;
        $totalCost = $data->amount;
        
        // Handle subcategory (can be null)
        $subCategory = isset($data->subCategory) ? $data->subCategory : null;
        
        // Prepare the update statement
        $stmt = $conn->prepare("UPDATE report SET expenseName = ?, category = ?, amount = ?, 
                                quantity = ?, totalCost = ?, dateOfExpense = ?, description = ? 
                                WHERE reportID = ?");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("ssdidssi", 
            $data->expenseName,
            $data->category,
            $data->amount,
            $quantity,
            $totalCost,
            $data->dateOfExpense,
            $data->description,
            $data->reportID
        );
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                "success" => true,
                "message" => "Expense report updated successfully"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "No changes made or report not found"
            ]);
        }
        
        $stmt->close();
    }
    
    // Handle DELETE request - Delete an expense report
    elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // Get reportID from URL parameter
        $reportID = isset($_GET['reportID']) ? intval($_GET['reportID']) : null;
        
        if (!$reportID) {
            throw new Exception("Report ID is required for deletion.");
        }
        
        // Prepare the delete statement
        $stmt = $conn->prepare("DELETE FROM report WHERE reportID = ?");
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("i", $reportID);
        
        if (!$stmt->execute()) {
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                "success" => true,
                "message" => "Expense report deleted successfully"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Report not found"
            ]);
        }
        
        $stmt->close();
    }
    
    else {
        http_response_code(405);
        echo json_encode([
            "success" => false,
            "message" => "Method not allowed"
        ]);
    }
    
    $conn->close();

} catch (Exception $e) {
    error_log("Expense report error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred. Please try again later.",
        "debug" => $e->getMessage() // Remove this line in production
    ]);
}
?>