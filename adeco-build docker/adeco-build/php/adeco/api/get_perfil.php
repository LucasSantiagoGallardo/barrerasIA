<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Mostrar errores (solo en desarrollo)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$mysqli = new mysqli('localhost', 'root', '', 'adeco');
$dni = $_GET['dni'] ?? '';

if (!$dni) {
    echo json_encode(['error' => 'DNI requerido']);
    exit;
}

// Consultar datos del perfil
$result = $mysqli->query("SELECT * FROM dni WHERE Dni = '$dni'");
if (!$result) {
    echo json_encode(['error' => 'Error en la consulta principal', 'detalle' => $mysqli->error]);
    exit;
}

$data = $result->fetch_assoc();
if (!$data) {
    echo json_encode(['error' => 'No se encontró el perfil con ese DNI']);
    exit;
}

// Documentación
$data['documentacion'] = [];
$docs = $mysqli->query("SELECT * FROM documentacion_usuario WHERE dni = '$dni'");
if ($docs) {
    while ($row = $docs->fetch_assoc()) {
        $data['documentacion'][] = $row;
    }
}

$docs = [];
$docQuery = $mysqli->query("SELECT tipo, estado, vencimiento, archivo_url FROM documentacion_usuario WHERE dni = '$dni'");
while ($row = $docQuery->fetch_assoc()) {
  $docs[] = $row;
}
$data['documentacion'] = $docs;
// Historial
$data['historial'] = [];
$hist = $mysqli->query("SELECT * FROM historial WHERE dni = '$dni' ORDER BY fecha DESC, hora DESC LIMIT 20");
if ($hist) {
    while ($row = $hist->fetch_assoc()) {
        $data['historial'][] = $row;
    }
}

echo json_encode($data);
?>
