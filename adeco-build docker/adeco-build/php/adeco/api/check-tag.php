<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require 'db.php';

$rfid_id = $_GET['id_tag'] ?? null; // se sigue llamando id_tag en el frontend

if (!$rfid_id) {
    echo json_encode(['error' => 'Falta el parámetro id_tag']);
    http_response_code(400);
    exit;
}

$stmt = $conn->prepare("SELECT tipo FROM tag WHERE rfid_id = :rfid_id");
$stmt->execute([':rfid_id' => $rfid_id]);
$result = $stmt->fetch(PDO::FETCH_ASSOC);

if ($result) {
    echo json_encode(['found' => true, 'tipo' => $result['tipo']]);
} else  {
    echo json_encode(['found' => false]);
}
