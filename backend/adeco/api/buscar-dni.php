<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';

$termino = $_POST['termino'] ?? '';

if (!$termino) {
    echo json_encode([]);
    exit;
}

$stmt = $conn->prepare("
    SELECT Dni, Name, Last_Name, Id_Customer, Id_Key, Permission_End, Obs, Order_POS, Update_NO, Active, Telefono, id, patente, tag
    FROM dni
    WHERE 
        Dni LIKE :t OR
        Name LIKE :t OR
        Last_Name LIKE :t OR
        Id_Key LIKE :t OR
        patente LIKE :t OR
        tag LIKE :t
    LIMIT 30
");

$like = '%' . $termino . '%';
$stmt->execute([':t' => $like]);

$resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($resultados);
?>
