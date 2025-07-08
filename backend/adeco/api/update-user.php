<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');
require 'db.php';

// Leer datos de la solicitud
$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['Dni']) || empty($data['Name']) || empty($data['Last_Name'])) {
    echo json_encode(['error' => 'Faltan campos obligatorios']);
    http_response_code(400);
    exit;
}

try {
    $dni = $data['Dni'];
    $id_key = $data['Id_Key'] ?? '';
    $tag = $data['tag'] ?? '';

    // Verificar duplicados en otros registros
    $query = $conn->prepare("
        SELECT Dni, Name, Last_Name, Id_Key, tag 
        FROM dni 
        WHERE (Dni = :dni OR Id_Key = :id_key OR tag = :tag)
          AND Dni != :current_dni
    ");
    $query->execute([
        ':dni' => $dni,
        ':id_key' => $id_key,
        ':tag' => $tag,
        ':current_dni' => $dni
    ]);

    $existing = $query->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        $conflictField = '';
        if ($existing['Dni'] === $dni) $conflictField = 'El DNI';
        elseif ($existing['Id_Key'] === $id_key) $conflictField = 'La llave';
        elseif ($existing['tag'] === $tag) $conflictField = 'El tag';

        echo json_encode([
            'error' => "$conflictField ya está asignado a {$existing['Name']} {$existing['Last_Name']} (DNI: {$existing['Dni']})"
        ]);
        http_response_code(409);
        exit;
    }

    // Actualizar usuario
    $stmt = $conn->prepare("
        UPDATE dni 
        SET Name = :Name,
            Last_Name = :Last_Name,
            Telefono = :Telefono,
            Active = :Active,
            Id_Key = :Id_Key,
            Id_Customer = :Id_Customer,
            tag = :tag
        WHERE Dni = :Dni
    ");
    $stmt->execute([
        ':Name' => $data['Name'],
        ':Last_Name' => $data['Last_Name'],
        ':Telefono' => $data['Telefono'] ?? '',
        ':Active' => $data['Active'] ?? 'True',
        ':Id_Key' => $data['Id_Key'] ?? '',
        ':Id_Customer' => $data['Id_Customer'] ?? null,
        ':tag' => $data['tag'] ?? '',
        ':Dni' => $data['Dni']
    ]);

    $stmtInsert = $conn->prepare("
    INSERT INTO asig (ID_dni, ID_tag, Mov, fecha)
    VALUES (:ID_dni, :ID_tag, :Mov, NOW())
");

$stmtInsert->execute([
    ':ID_dni' => $data['Dni'],
    ':ID_tag' => $data['tag'],
    ':Mov' => 'Asignado'
]);
    echo json_encode(['message' => 'Usuario actualizado correctamente']);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error al actualizar usuario: ' . $e->getMessage()]);
    http_response_code(500);
}
