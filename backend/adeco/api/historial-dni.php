<?php
header('Content-Type: application/json');
require 'db.php';

$dni = $_GET['dni'] ?? null;

if (!$dni) {
    echo json_encode(["error" => "DNI no especificado"]);
    exit;
}

$stmt = $conn->prepare("SELECT barrera, estado, timestamp FROM hist WHERE dni = :dni ORDER BY timestamp DESC");
$stmt->execute([':dni' => $dni]);

$registros = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($registros);
?>
