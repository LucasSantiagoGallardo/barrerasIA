<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';

$input = json_decode(file_get_contents("php://input"), true);
$epc_hex = $input['epc'] ?? $_POST['epc'] ?? null;

if (!$epc_hex) {
    echo json_encode(['habilitado' => false, 'motivo' => 'Falta tag']);
    http_response_code(400);
    exit;
}

try {
    // Busca el tag en dni (puede ser 'tag' o 'Id_Key')
    $stmt = $conn->prepare("SELECT * FROM dni WHERE (tag = :tag OR Id_Key = :tag) LIMIT 1");
    $stmt->execute([':tag' => $epc_hex]);
    $dni_row = $stmt->fetch(PDO::FETCH_ASSOC);

    $habilitado = ($dni_row && $dni_row["Active"] === 'True');
    $barrera = $input['nombre'] ?? $_POST['nombre'] ?? null;
    $dni = $dni_row['Dni'] ?? ($input['dni'] ?? $_POST['dni'] ?? null);
    $nombre = $dni_row['Name'] ?? ($input['nombreApe'] ?? $_POST['nombreApe'] ?? 'Desconocido');
    $apellido = $dni_row['Last_Name'] ?? 'Desconocido';

    // SIEMPRE guardar el intento en hist, aunque sea denegado
    if ($barrera && $epc_hex) {
        $hist = $conn->prepare("INSERT INTO hist (Id_Key, barrera, dni, nombre, apellido, resultado) VALUES (:id_key, :barrera, :dni, :nombre, :apellido, :resultado)");
        $hist->execute([
            ':id_key' => $epc_hex,
            ':barrera' => $barrera,
            ':dni' => $dni,
            ':nombre' => $nombre,
            ':apellido' => $apellido,
            ':resultado' => $habilitado ? 'permitido' : 'denegado'
        ]);
    }

    echo json_encode([
        'habilitado' => $habilitado,
        'id_tag' => $epc_hex,
        'dni' => $dni_row['Dni'] ?? null,
        'nombre' => $dni_row['Name'] ?? null,
        'apellido' => $dni_row['Last_Name'] ?? null,
    ]);
} catch (Exception $e) {
    echo json_encode([
        'error' => 'Error en base de datos',
        'detalles' => $e->getMessage()
    ]);
    http_response_code(500);
}
?>
