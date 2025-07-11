<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

// Leer datos de la solicitud POST
$input = json_decode(file_get_contents('php://input'), true);
$id_key = $input['Id_Key'] ?? null;
$lector = $input['lector'] ?? null;

if (!$id_key) {
    echo json_encode([
        "status" => "error",
        "message" => "Id_Key no proporcionado"
    ]);
    exit;
}

// Conexión a la base de datos
$host = 'localhost';
$dbname = 'adeco';
$username = 'root';
$password = '';
$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode([
        "status" => "not_found",
        "message" => "Id_Key no encontrado en la base de datos"
    ]);
   
    exit;
}

// Consulta en la tabla dni
$query = "SELECT * FROM dni WHERE Id_Key = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $id_key);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Si encuentra el registro, obtener los detalles
    $row = $result->fetch_assoc();
    $dni = $row['Dni'];
    $estado = "permitido";
    $barrera = $lector; // Puedes personalizar este valor si es dinámico
    $insertQuery = "INSERT INTO hist (Id_Key, dni, barrera, estado) VALUES (?, ?, ?, ?)";
    $insertStmt = $conn->prepare($insertQuery);
    $insertStmt->bind_param("ssss", $id_key, $dni, $barrera, $estado);
    $insertStmt->execute();
    $insertStmt->close();

    echo json_encode([
        "status" => "found",
        "details" => $row
    ]);
} else {
    // Si no encuentra el registro, insertar con valores predeterminados
    $dni = null;
    $estado = "denegado";
    $barrera = "Barrera_1"; // Puedes personalizar este valor si es dinámico
    $insertQuery = "INSERT INTO hist (Id_Key, dni, barrera, estado) VALUES (?, ?, ?, ?)";
    $insertStmt = $conn->prepare($insertQuery);
    $insertStmt->bind_param("ssss", $id_key, $dni, $barrera, $estado);
    $insertStmt->execute();
    $insertStmt->close();

    echo json_encode([
        "status" => "not_found",
        "message" => "Id_Key no encontrado en la base de datos"
    ]);
}

// Cerrar conexiones
$stmt->close();
$conn->close();
?>
