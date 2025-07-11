<?php
// Agregar cabeceras de CORS
header("Access-Control-Allow-Origin: http://localhost:3000"); // Cambia esto al origen de tu frontend
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

header('Content-Type: application/json');
require 'db.php';

$cards = [
    'total' => 0,
    'totala' => 0,
    'totalp' => 0,
    'asigc' => 0,
    'asigl' => 0,
    'dispoc' => 0,
    'dispol' => 0
];

try {
    // Total de tags
    $totalResult = $conn->query("SELECT COUNT(Id_Key) FROM dni WHERE Id_Key IS NOT NULL AND Id_Key != '' " );
    $total = $totalResult->fetchColumn();
    $cards['total'] = $total;

    $totaladeco = $conn->query("SELECT COUNT(Id_Key) FROM dni WHERE Id_Key IS NOT NULL AND Id_Key != '' AND Id_Customer = '1'");
    $totalAdeco = $totaladeco->fetchColumn();
    $cards['totala']= $totalAdeco;
    $cards['totalp'] =  ($total - $totalAdeco);


    echo json_encode($cards);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    http_response_code(500);
} catch (Exception $e) {
    echo json_encode(['error' => 'General error: ' . $e->getMessage()]);
    http_response_code(500);
}
?>