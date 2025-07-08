<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require 'db.php';

try {
    $stmt = $conn->query("
       SELECT u.*, t.* FROM hist t LEFT JOIN dni u ON t.dni = u.Dni LIMIT 10;
    ");
    $recentUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($recentUsers);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error fetching recent users: ' . $e->getMessage()]);
    http_response_code(500);
}
?>
