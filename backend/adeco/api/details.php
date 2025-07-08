<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); // Cambia al dominio correcto
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Validar entrada
if (!isset($_GET['dni']) || empty($_GET['dni'])) {
    echo json_encode(['error' => 'DNI no proporcionado']);
    http_response_code(400);
    exit;
}

$dni = $_GET['dni'];

try {
    $query = "
        SELECT 
            ah.Event_Date,
            ah.Type_Mov,
            ah.ID_Access_Point,
            d.Name,
            d.Last_Name,
            CASE 
                WHEN ah.ID_Access_Point IN (1, 2) THEN 'Tambo1'
                WHEN ah.ID_Access_Point IN (3, 4) THEN 'Tambo2'
                ELSE 'Desconocido'
            END AS Barrera,
            CASE 
                WHEN ah.Type_Mov = 'IN' THEN 'Entrada'
                WHEN ah.Type_Mov = 'OUT' THEN 'Salida'
                ELSE 'Desconocido'
            END AS Movimiento
        FROM 
            access_hist ah
        INNER JOIN 
            dni d ON ah.Dni = d.Dni
        WHERE 
            ah.Dni = :dni
            GROUP BY
            AH.Event_Date
        
        ORDER BY 
            ah.Event_Date DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':dni', $dni, PDO::PARAM_STR);
    $stmt->execute();

    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($result) {
        echo json_encode($result);
    } else {
        echo json_encode(['message' => 'No se encontraron registros']);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error al obtener datos: ' . $e->getMessage()]);
    http_response_code(500);
}
?>
