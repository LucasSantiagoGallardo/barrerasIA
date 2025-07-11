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

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['id'])) {
    echo json_encode(['error' => 'ID is required']);
    http_response_code(400);
    exit;
}

try {
    $stmt = $conn->prepare("
        UPDATE providers
        SET company_name = :company_name,
            contact_name = :contact_name,
            email = :email,
            phone = :phone,
            key_expiration_date = :key_expiration_date,
            notes = :notes,
            active = :active
        WHERE id = :id
    ");
    $stmt->execute([
        ':id' => $data['id'],
        ':company_name' => $data['company_name'],
        ':contact_name' => $data['contact_name'] ?? null,
        ':email' => $data['email'] ?? null,
        ':phone' => $data['phone'] ?? null,
        ':key_expiration_date' => $data['key_expiration_date'],
        ':notes' => $data['notes'] ?? null,
        ':active' => $data['active'] ?? 1,
    ]);
    echo json_encode(['message' => 'Provider updated successfully']);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error updating provider']);
    http_response_code(500);
}
?>
