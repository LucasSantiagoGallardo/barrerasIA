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

// Consulta para obtener todos los Id_Key
$query = "SELECT Id_Key FROM dni";
$result = $conn->query($query);

if ($result && $result->num_rows > 0) {
    $keys = [];
    while ($row = $result->fetch_assoc()) {
        $keys[] = $row['Id_Key'];
    }
    echo json_encode($keys);
} else {
    echo json_encode([]);
}

$conn->close();
?>
