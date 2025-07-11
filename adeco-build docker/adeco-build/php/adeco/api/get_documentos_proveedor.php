<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$mysqli = new mysqli('localhost', 'root', '', 'adeco');
$proveedor_id = $_GET['proveedor_id'] ?? '';

if (!$proveedor_id) {
    echo json_encode([]);
    exit;
}

$stmt = $mysqli->prepare("SELECT tipo, archivo_url, vencimiento, observaciones FROM documentacion_proveedor WHERE proveedor_id = ?");
$stmt->bind_param("s", $proveedor_id);
$stmt->execute();
$result = $stmt->get_result();

$documentos = [];
while ($row = $result->fetch_assoc()) {
    $documentos[] = $row;
}

echo json_encode($documentos);
?>