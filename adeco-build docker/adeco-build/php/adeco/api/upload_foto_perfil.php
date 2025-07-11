<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$mysqli = new mysqli('localhost', 'root', '', 'adeco');

$dni = $_POST['dni'] ?? '';
$tipo = $_POST['tipo'] ?? ''; // 'fotoPerfilUrl' o 'fotoVehiculoUrl'
$archivo = $_FILES['archivo'] ?? null;

if (!$dni || !$tipo || !$archivo || !in_array($tipo, ['fotoPerfilUrl', 'fotoVehiculoUrl'])) {
  echo json_encode(['error' => 'Faltan parámetros válidos']);
  exit;
}

$ext = pathinfo($archivo['name'], PATHINFO_EXTENSION);
$nombre = $tipo . '_' . time() . '.' . $ext;
$directorio = __DIR__ . "/fotos_perfil/$dni/";

if (!is_dir($directorio)) {
  mkdir($directorio, 0755, true);
}

$rutaFinal = $directorio . $nombre;

if (!move_uploaded_file($archivo['tmp_name'], $rutaFinal)) {
  echo json_encode(['error' => 'No se pudo guardar la imagen']);
  exit;
}

$urlRelativa = "fotos_perfil/$dni/$nombre";

$stmt = $mysqli->prepare("UPDATE dni SET $tipo = ? WHERE Dni = ?");
if (!$stmt) {
  echo json_encode(['error' => 'Error SQL: ' . $mysqli->error]);
  exit;
}
$stmt->bind_param("ss", $urlRelativa, $dni);
$stmt->execute();

echo json_encode(['success' => true, 'url' => $urlRelativa]);
?>