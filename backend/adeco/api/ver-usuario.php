<?php
header('Content-Type: application/json');
require 'db.php';

$dni = $_GET['dni'] ?? null;

if (!$dni) {
    echo json_encode(["error" => "DNI no especificado"]);
    exit;
}

$stmt = $conn->prepare("SELECT * FROM dni WHERE Dni = :dni LIMIT 1");
$stmt->execute([':dni' => $dni]);

$usuario = $stmt->fetch(PDO::FETCH_ASSOC);
echo json_encode($usuario ?: []);
?>
