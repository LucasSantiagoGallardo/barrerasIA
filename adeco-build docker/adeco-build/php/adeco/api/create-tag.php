<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

// Manejar preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

$rfid_id = $data['id_tag'] ?? null;
$tipo = $data['tipo'] ?? null;

if (!$rfid_id || !$tipo) {
    echo json_encode(['error' => 'Faltan datos requeridos']);
    http_response_code(400);
    exit;
}

try {
    $stmt = $conn->prepare("
        INSERT INTO tag (rfid_id, tipo, estado, fecha)
        VALUES (:rfid_id, :tipo, 1, NOW())
    ");
    $stmt->execute([
        ':rfid_id' => $rfid_id,
        ':tipo' => $tipo
    ]);

    

$stmtInsert = $conn->prepare("INSERT INTO asig (ID_tag, Mov, fecha) VALUES ('$rfid_id', 'Creado', NOW())");

$stmtInsert->execute();
    echo json_encode(['message' => 'Tag creado correctamente']);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error al crear el tag: ' . $e->getMessage()]);
    http_response_code(500);
}
