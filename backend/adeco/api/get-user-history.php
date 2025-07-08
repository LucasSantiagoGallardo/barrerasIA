<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');


header('Content-Type: application/json');
require 'db.php';

if (!isset($_GET['Dni'])) {
    echo json_encode(['error' => 'Missing DNI parameter']);
    exit;
}

$Dni = $_GET['Dni'];

try {
    $stmt = $conn->prepare("
        SELECT 
            ah.Event_Date, 
            ah.Type_Mov, 
            ah.ID_Access_Point 
        FROM 
            access_hist ah 
        WHERE 
            ah.Dni = ?
        ORDER BY 
            ah.Event_Date DESC
    ");
    $stmt->execute([$Dni]);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($history);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error fetching data: ' . $e->getMessage()]);
}

?>