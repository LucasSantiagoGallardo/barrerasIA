<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: *');
header('Content-Type: application/json');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$mysqli = new mysqli('localhost', 'root', '', 'adeco');

$proveedor_id = $_POST['proveedor_id'] ?? '';
$tipo = $_POST['tipo'] ?? '';
$vencimiento = $_POST['vencimiento'] ?? null;
$observaciones = $_POST['observaciones'] ?? '';

if (!$proveedor_id || !$tipo || !isset($_FILES['archivo'])) {
    echo json_encode(['error' => 'Faltan datos o archivo']);
    exit;
}

$ext = pathinfo($_FILES['archivo']['name'], PATHINFO_EXTENSION);
$nombreArchivo = $tipo . '.' . $ext;
$carpetaDestino = __DIR__ . "/documentacion_proveedor/$proveedor_id/";

if (!is_dir($carpetaDestino)) {
    mkdir($carpetaDestino, 0755, true);
}

$rutaFinal = $carpetaDestino . $nombreArchivo;

if (!move_uploaded_file($_FILES['archivo']['tmp_name'], $rutaFinal)) {
    echo json_encode(['error' => 'No se pudo guardar el archivo']);
    exit;
}

$urlRelativa = "documentacion_proveedor/$proveedor_id/$nombreArchivo";

$stmt = $mysqli->prepare("INSERT INTO documentacion_proveedor (proveedor_id, tipo, archivo_url, vencimiento, observaciones) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $proveedor_id, $tipo, $urlRelativa, $vencimiento, $observaciones);
$stmt->execute();

echo json_encode(['success' => true, 'archivo_url' => $urlRelativa]);
?>