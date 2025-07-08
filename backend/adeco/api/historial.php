<?php

// Agregar cabeceras de CORS
header("Access-Control-Allow-Origin: http://localhost:3000"); // Cambia esto al origen de tu frontend
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Responde con un 200 OK para solicitudes preflight
    http_response_code(200);
    exit;
}


header('Content-Type: application/json');

$dni = $_GET['dni'] ?? '';
if (!$dni) {
    echo json_encode([]);
    exit;
}

// Conexión a la base de datos
$mysqli = new mysqli('localhost', 'root', '', 'adeco');

// Verificar errores de conexión
if ($mysqli->connect_error) {
    die("Conexión fallida: " . $mysqli->connect_error);
}

$query = "SELECT fecha, barrera, accion FROM historial WHERE dni = ?";
$stmt = $mysqli->prepare($query);
$stmt->bind_param('s', $dni);
$stmt->execute();
$result = $stmt->get_result();

$historial = [];
while ($row = $result->fetch_assoc()) {
    $historial[] = $row;
}

$stmt->close();
$mysqli->close();

echo json_encode($historial);
?>
