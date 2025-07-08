<?php
header("Access-Control-Allow-Origin:*");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require 'db.php';

try {
    $stmt = $conn->query("
        SELECT id,Dni, Name, Active,Last_Name
        FROM dni 
        ORDER BY id DESC 
        LIMIT 5
    ");
    $recentUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($recentUsers);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error fetching recent users: ' . $e->getMessage()]);
    http_response_code(500);
}
?>
