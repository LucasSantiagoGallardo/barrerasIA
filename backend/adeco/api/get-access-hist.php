<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require 'db.php';

try {
    $stmt = $conn->prepare("
   SELECT 
            ah.Event_Date, 
            ah.Type_Mov, 
            ah.ID_Access_Point, 
            d.Name, 
            d.Last_Name,
            ah.ID_key
        FROM 
            access_hist ah
        INNER JOIN 
            dni d ON d.Dni = ah.Dni
        WHERE 
            (d.Active = 'True' OR d.Active = 'Yes')
            AND ah.ID_Access_Point IN (1, 2, 3, 4)
        GROUP BY 
            ah.Event_Date
        ORDER BY 
            ah.Event_Date DESC
        LIMIT 30 ");
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($data);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error fetching access history: ' . $e->getMessage()]);
    http_response_code(500);
}
?>
