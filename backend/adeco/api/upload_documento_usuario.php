<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$mysqli = new mysqli('localhost', 'root', '', 'adeco');

$dni = $_POST['dni'] ?? '';
$tipo = $_POST['tipo'] ?? '';
$archivo = $_FILES['archivo'] ?? null;

if (!$dni || !$tipo || !$archivo) {
  echo json_encode(['error' => 'Faltan parámetros']);
  exit;
}

$ext = pathinfo($archivo['name'], PATHINFO_EXTENSION);
$nombreFinal = strtolower($tipo) . '_' . time() . '.' . $ext;
$carpeta = __DIR__ . '/documentos_usuario/' . $dni;

if (!is_dir($carpeta)) {
  mkdir($carpeta, 0755, true);
}

$rutaFinal = $carpeta . '/' . $nombreFinal;
if (!move_uploaded_file($archivo['tmp_name'], $rutaFinal)) {
  echo json_encode(['error' => 'Error al mover el archivo']);
  exit;
}

$urlRelativa = 'documentos_usuario/' . $dni . '/' . $nombreFinal;

$delete = $mysqli->prepare("DELETE FROM documentacion_usuario WHERE dni = ? AND tipo = ?");
$delete->bind_param("ss", $dni, $tipo);
$delete->execute();

$insert = $mysqli->prepare("INSERT INTO documentacion_usuario (dni, tipo, estado, vencimiento, archivo_url) VALUES (?, ?, 'vigente', '', ?)");
$insert->bind_param("sss", $dni, $tipo, $urlRelativa);
$insert->execute();

echo json_encode(['success' => true, 'archivo' => $urlRelativa]);
?>
