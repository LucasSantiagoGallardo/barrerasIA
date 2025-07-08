<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';
$input = json_decode(file_get_contents("php://input"), true);

$epc =$input['uid'] ?? $input['epc'] ?? null;

if (!$epc) {
    echo json_encode(["error" => "EPC no recibido"]);
    exit;
}

// Validar existencia y estado
$stmt = $conn->prepare("SELECT * FROM dni WHERE tag = :rfid_id");
$stmt->execute([':rfid_id' => $epc]);
$result = $stmt->fetch(PDO::FETCH_ASSOC);

if ($result && $result['Active'] === 'True') {

    // Evitar registrar múltiples veces en poco tiempo
    $checkStmt = $conn->prepare("SELECT timestamp FROM hist WHERE Id_Key = :id_key ORDER BY timestamp DESC LIMIT 1");
    $checkStmt->execute([':id_key' => $epc]);
    $lastEntry = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($lastEntry) {
        $lastTime = strtotime($lastEntry['timestamp']);
        if (time() - $lastTime < 30) {
            echo json_encode(["habilitado" => true, "mensaje" => "Repetido ignorado"]);
            exit;
        }
    }

    // Registrar nuevo acceso
    $histStmt = $conn->prepare("INSERT INTO hist (Id_Key, dni, barrera, estado, nombre, apellido) VALUES (:id_key, :dni, :barrera, :estado, :nombre, :apellido)");
    $histStmt->execute([
        ':id_key'   => $epc,
        ':dni'      => $result['Dni'],
        ':barrera'  => 'ingreso tb1',
        ':estado'   => 'permitido',
        ':nombre'   => $result['Name'],
        ':apellido' => $result['Last_Name']
    ]);

    echo json_encode(["habilitado" => true]);
} else {
    echo json_encode(["habilitado" => false]);
}

