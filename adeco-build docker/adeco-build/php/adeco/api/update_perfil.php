<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$mysqli = new mysqli('localhost', 'root', '', 'adeco');
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['dni'])) {
    echo json_encode(['error' => 'Datos inválidos']);
    exit;
}

$dni = $data['dni'];

$sql = "UPDATE dni SET 
    Name = ?, 
    Last_Name = '', 
    Id_Key = ?, 
    Patente = ?, 
    tag = ?, 
    Telefono = ?, 
    Id_Customer = ?, 
    Active = ?, 
    Obs = ?, 
    Permission_End = ? 
WHERE Dni = ?";


$update = $mysqli->prepare($sql);
if (!$update) {
    echo json_encode(['error' => 'Error al preparar el UPDATE', 'detalle' => $mysqli->error]);
    exit;
}

$update->bind_param(
    "ssssssssss",
    $data['nombre'],
    $data['idKey'],
    $data['patente'],
    $data['tag'],
    $data['telefono'],
    $data['proveedor'],
    $data['activo'],
    $data['obs'],
    $data['permisoHasta'],
    $dni
);
$update->execute();

// limpiar y volver a insertar documentación
$mysqli->query("DELETE FROM documentacion_usuario WHERE dni = '$dni'");

foreach ($data['documentacion'] as $doc) {
    $ins = $mysqli->prepare("INSERT INTO documentacion_usuario (dni, tipo, estado, vencimiento) VALUES (?, ?, ?, ?)");
    if ($ins) {
        $ins->bind_param("ssss", $dni, $doc['tipo'], $doc['estado'], $doc['vencimiento']);
        $ins->execute();
    }
}

echo json_encode(['success' => true]);
?>
