<?php
// Agregar cabeceras de CORS
header("Access-Control-Allow-Origin: http://localhost:3000"); // Cambia esto al origen de tu frontend
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

header('Content-Type: application/json');
require 'db.php';

$cards = [
    'total' => 0,
    'totalc' => 0,
    'totall' => 0,
    'asigc' => 0,
    'asigl' => 0,
    'dispoc' => 0,
    'dispol' => 0
];

try {
    // Total de tags
    $totalResult = $conn->query("SELECT COUNT(*) FROM `tag`");
    $total = $totalResult->fetchColumn();
    $cards['total'] = $total;

    // Totales por tipo (calcomanías y llaveros)
    $totalesResult = $conn->query("SELECT tipo, COUNT(*) as count FROM `tag` GROUP BY tipo");
    while ($row = $totalesResult->fetch(PDO::FETCH_ASSOC)) {
        if ($row['tipo'] === 'calcomania') {
            $cards['totalc'] = (int)$row['count'];
        } elseif ($row['tipo'] === 'llavero') {
            $cards['totall'] = (int)$row['count'];
        }
    }

    // Tags asignados (calcomanías)
    $asignadosCResult = $conn->query("SELECT COUNT(tag) FROM `dni` JOIN tag on dni.tag = tag.rfid_id WHERE tag.tipo = 'calcomania'");
    $cards['asigc'] = (int)$asignadosCResult->fetchColumn();

    // Tags asignados (llaveros)
    $asignadosLResult = $conn->query("SELECT COUNT(tag) FROM `dni` JOIN tag on dni.tag = tag.rfid_id WHERE tag.tipo = 'llavero'");
    $cards['asigl'] = (int)$asignadosLResult->fetchColumn();

    // Tags disponibles para asignar
    $cards['dispoc'] = $cards['totalc'] - $cards['asigc'];
    $cards['dispol'] = $cards['totall'] - $cards['asigl'];

    echo json_encode($cards);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    http_response_code(500);
} catch (Exception $e) {
    echo json_encode(['error' => 'General error: ' . $e->getMessage()]);
    http_response_code(500);
}
?>