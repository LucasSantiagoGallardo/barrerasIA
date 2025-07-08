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
    // Validar duplicados
    $dni = $data['Dni'];
    $id_key = $data['Id_Key'] ?? '';
    $tag = $data['tag'] ?? '';

    $query = $conn->prepare("
        SELECT Dni, Name, Last_Name, Id_Key, tag 
        FROM dni 
        WHERE Dni = :dni OR Id_Key = :id_key OR tag = :tag
    ");
    $query->execute([
        ':dni' => $dni,
        ':id_key' => $id_key,
        ':tag' => $tag
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
        http_response_code(409); // Conflicto
        exit;
    }

    // Insertar en la base de datos
    $stmt = $conn->prepare("
        INSERT INTO dni (Dni, Name, Last_Name, Telefono, Active, Id_Key, Id_Customer, tag) 
        VALUES (:Dni, :Name, :Last_Name, :Telefono, :Active, :Id_Key, :Id_Customer, :tag)");
    $stmt->execute([
        ':Dni' => $data['Dni'],
        ':Name' => $data['Name'],
        ':Last_Name' => $data['Last_Name'],
        ':Telefono' => $data['Telefono'] ?? '',
        ':Active' => $data['Active'] ?? 'True',
        ':Id_Key' => $data['Id_Key'] ?? '',
        ':Id_Customer' => $data['Id_Customer'] ?? null,
        ':tag' => $data['tag'] ?? ''
    ]);

    echo json_encode(['message' => 'Usuario creado correctamente']);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error al crear usuario: ' . $e->getMessage()]);
    http_response_code(500);
}
