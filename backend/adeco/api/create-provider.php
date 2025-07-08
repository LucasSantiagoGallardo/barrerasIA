<?php
// Configuración de CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Manejar solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Código del script para manejar POST
require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['company_name']) || empty($data['key_expiration_date'])) {
    echo json_encode(['error' => 'Missing required fields']);
    http_response_code(400);
    exit;
}

try {
    $stmt = $conn->prepare("
        INSERT INTO providers (company_name, contact_name, email, phone, key_expiration_date, notes, active)
        VALUES (:company_name, :contact_name, :email, :phone, :key_expiration_date, :notes, :active)
    ");
    $stmt->execute([
        ':company_name' => $data['company_name'],
        ':contact_name' => $data['contact_name'] ?? null,
        ':email' => $data['email'] ?? null,
        ':phone' => $data['phone'] ?? null,
        ':key_expiration_date' => $data['key_expiration_date'],
        ':notes' => $data['notes'] ?? null,
        ':active' => $data['active'] ?? 1,
    ]);
    echo json_encode(['message' => 'Provider created successfully']);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error creating provider']);
    http_response_code(500);
}
?>
