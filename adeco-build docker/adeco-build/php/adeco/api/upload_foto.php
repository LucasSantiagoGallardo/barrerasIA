<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$targetDir = isset($_GET['tipo']) && $_GET['tipo'] === 'vehiculo' ? '../public/fotos_vehiculo/' : '../public/fotos_perfil/';
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

if (!isset($_FILES['foto']) || !isset($_POST['dni'])) {
    echo json_encode(['error' => 'Falta archivo o DNI']);
    exit;
}

$dni = $_POST['dni'];
$ext = pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION);
$filename = $dni . "." . $ext;
$targetFile = $targetDir . $filename;

if (move_uploaded_file($_FILES['foto']['tmp_name'], $targetFile)) {
    echo json_encode(['success' => true, 'url' => $targetFile]);
} else {
    echo json_encode(['error' => 'Error al guardar la imagen']);
}
?>
