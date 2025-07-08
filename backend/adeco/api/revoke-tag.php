<?php
// revoke-tag.php

// Establecer encabezados para permitir solicitudes desde cualquier origen y especificar el tipo de contenido
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Verificar que se haya recibido el parámetro 'dni' mediante GET
if (!isset($_GET['dni'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta el parámetro DNI']);
    exit;
}

$dni = $_GET['dni'];
$compa =$_GET['custo'];
$tag=$_GET['tag'];
// Incluir el archivo de conexión a la base de datos
require_once 'db.php'; // Asegúrate de que este archivo establece la conexión en $conn

// Preparar la consulta SQL para actualizar el campo 'tag' a una cadena vacía
$stmt = $conn->prepare("UPDATE dni SET tag = '' WHERE Dni = '$dni'");

// Ejecutar la consulta y verificar si fue exitosa
if ($stmt->execute()) {
    echo json_encode(['message' => 'Tag revocado exitosamente']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al revocar el tag']);
}



$stmtInsert = $conn->prepare("INSERT INTO asig (ID_dni, ID_tag, ID_customer, Mov, fecha) VALUES ('$dni', '$tag','$compa', 'revoke', NOW())");

$stmtInsert->execute();



?>
