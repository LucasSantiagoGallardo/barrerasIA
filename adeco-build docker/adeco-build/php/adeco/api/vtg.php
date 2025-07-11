<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php'; // asegurate que esto conecta correctamente con tu base 

try {
    $stmt = $conn->prepare("SELECT Id_key, Name, Last_Name, Dni,tag  FROM dni WHERE Active = 'True' and tag !='' OR Id_key !='' ");
    $stmt->execute();
    $tags = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "estado" => "ok",
        "total" => count($tags),
        "datos" => $tags
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "estado" => "error",
        "mensaje" => "Error de base de datos",
        "detalle" => $e->getMessage()
    ]);
}
