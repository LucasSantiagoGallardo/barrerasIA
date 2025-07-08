<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$mysqli = new mysqli('localhost', 'root', '', 'adeco');

$proveedor_id = $_POST['proveedor_id'] ?? '';
$tipo = $_POST['tipo'] ?? '';
$archivo = $_FILES['archivo'] ?? null;

if (!$proveedor_id || !$tipo || !$archivo) {
  echo json_encode(['error' => 'Faltan parámetros']);
  exit;
}

$ext = pathinfo($archivo['name'], PATHINFO_EXTENSION);
$nombre = $tipo . '_' . time() . '.' . $ext;
$directorio = __DIR__ . "../../api/documentacion_proveedor/$proveedor_id/";

if (!is_dir($directorio)) {
  mkdir($directorio, 0755, true);
}

$rutaFinal = $directorio . $nombre;

if (!move_uploaded_file($archivo['tmp_name'], $rutaFinal)) {
  echo json_encode(['error' => 'No se pudo guardar el archivo']);
  exit;
}

$urlRelativa = "documentacion_proveedor/$proveedor_id/$nombre";

// Insertar en base de datos
$stmt = $mysqli->prepare("INSERT INTO documentacion_proveedor (proveedor_id, tipo, archivo_url) VALUES (?, ?, ?)");
if (!$stmt) {
  echo json_encode(['error' => 'Error al preparar SQL', 'detalle' => $mysqli->error]);
  exit;
}

$stmt->bind_param("sss", $proveedor_id, $tipo, $urlRelativa);
$stmt->execute();

echo json_encode(['success' => true, 'archivo_url' => $urlRelativa]);
?>