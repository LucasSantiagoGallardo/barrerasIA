<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require 'db.php'; // Asegurate de tener bien configurado el acceso a tu base

try {
    $query = $conn->prepare("
        SELECT 
            a.ID,
            d.Dni,
            d.Name,
            d.Last_Name,
            d.tag AS Tag,
            a.Mov AS Asignado,
            p.company_name,
            a.fecha
        FROM asig a
        JOIN dni d ON d.Dni = a.ID_dni
        JOIN providers p ON d.Id_Customer = p.id
        WHERE 
            a.Mov = 'Asignado'
            AND p.company_name != 'AdecoAgro'
        ORDER BY a.fecha DESC
    ");
    
    $query->execute();
    $result = $query->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode([
        'error' => 'Error al obtener datos: ' . $e->getMessage()
    ]);
    http_response_code(500);
}
