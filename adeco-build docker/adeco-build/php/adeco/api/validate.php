<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

// Configuración de la base de datos
$host = 'localhost';
$dbname = 'adeco';
$username = 'root';
$password = '';

// Conexión a la base de datos
$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["error" => "Conexión fallida: " . $conn->connect_error]);
    exit;
}

// Leer datos de la solicitud POST
$input = json_decode(file_get_contents('php://input'), true);
$id_key = $input['Id_Key'] ?? null;

if (!$id_key) {
    echo json_encode(["error" => "Id_Key no proporcionado"]);
    exit;
}

// Consulta en la base de datos
$query = "SELECT * FROM dni WHERE Id_Key = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $id_key);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
          // Insertar en la tabla de historial
          $insertStmt = $conn->prepare("INSERT INTO `hist` (`Id_Key`, `dni`, `barrera`, `estado`) VALUES (:id_key, :dni, :barrera, 'permitido')");
          $insertStmt->bindParam(':id_key', $dni);
          $insertStmt->bindParam(':dni', $result['Dni']);
          $insertStmt->bindParam(':barrera', $barrera);
          $insertStmt->execute();

          
    $row = $result->fetch_assoc();
    echo json_encode([
        "status" => "found",
        "details" => $row
    ]);
} else {
    echo json_encode([
        "status" => "not_found"
    ]);
}

$stmt->close();
$conn->close();
?>
