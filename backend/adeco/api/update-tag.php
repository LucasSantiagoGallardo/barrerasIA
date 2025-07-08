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
$estado = isset($data['estado']) ? intval($data['estado']) : null;
$allowed = $data['Active'];
$dni = $data['dni'];



if($allowed == 'False'){

    $stmt3 = $conn->prepare("
    UPDATE dni SET tag ='' WHERE tag = :rfid_id");
$stmt3->execute([
    ':rfid_id' => $rfid_id
    
]);
}

if (!$rfid_id || !isset($estado)) {
    echo json_encode(['error' => 'Faltan datos requeridos']);
    http_response_code(400);
    exit;
}

try {
    $stmt = $conn->prepare("
        UPDATE tag SET estado = :estado WHERE rfid_id = :rfid_id
    ");
    $stmt->execute([
        ':rfid_id' => $rfid_id,
        ':estado' => $allowed
    ]);

    $stmtInsert = $conn->prepare("INSERT INTO asig (ID_dni, ID_tag, Mov, fecha) VALUES ('$dni', '$rfid_id', '$estado', NOW())");

$stmtInsert->execute();

    echo json_encode(['message' => 'Tag actualizado correctamente']);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error al actualizar el tag: ' . $e->getMessage()]);
    http_response_code(500);
}
