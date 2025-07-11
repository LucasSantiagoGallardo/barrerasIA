<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Manejar solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


header('Content-Type: application/json');
require 'db.php';

if (empty($_GET['id'])) {
    echo json_encode(['error' => 'ID is required']);
    http_response_code(400);
    exit;
}

try {
    $stmt = $conn->prepare("DELETE FROM providers WHERE id = :id");
    $stmt->execute([':id' => $_GET['id']]);
    echo json_encode(['message' => 'Provider deleted successfully']);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error deleting provider']);
    http_response_code(500);
}
?>
