<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require 'db.php';

try {
    $metrics = [];

    // Usuarios Activos
    $stmt = $conn->query("SELECT COUNT(*) AS active_users FROM dni WHERE Active = 'Yes' or Active = 'True'");
    $metrics['active_users'] = $stmt->fetch(PDO::FETCH_ASSOC)['active_users'];

    // Llaves Activas e Inactivas
    $stmt = $conn->query("
       SELECT 
    SUM(CASE WHEN Id_Key != ''  THEN 1 ELSE 0 END) AS active_keys,
    SUM(CASE WHEN Id_Key  = ''   THEN 0 ELSE 0 END) AS inactive_keys
FROM dni
    ");
    $keyStats = $stmt->fetch(PDO::FETCH_ASSOC);
    $metrics['active_keys'] = $keyStats['active_keys'];
    $metrics['inactive_keys'] = $keyStats['inactive_keys'];

    // Proveedores
    $stmt = $conn->query("SELECT COUNT(*) AS total_providers FROM providers");
    $metrics['total_providers'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_providers'];

    echo json_encode($metrics);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error fetching metrics: ' . $e->getMessage()]);
    http_response_code(500);
}
?>
