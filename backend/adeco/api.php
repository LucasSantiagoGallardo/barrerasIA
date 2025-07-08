<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Conexión a la base de datos SQLite o MySQL
$db = new PDO('sqlite:epcs.db'); // Para MySQL: PDO("mysql:host=localhost;dbname=nombre", "user", "pass");

// Leer el cuerpo del POST
$input = json_decode(file_get_contents('php://input'), true);
$epc = $input['epc'] ?? null;

if (!$epc) {
    echo json_encode(["error" => "EPC no recibido"]);
    exit;
}

if (!$epc) {
    echo json_encode([
        "epc" => $epc,
        "habilitado" => TRUE
    ]);
} else {
    echo json_encode([
        "epc" => $epc,
        "habilitado" => false
    ]);
}
?>
