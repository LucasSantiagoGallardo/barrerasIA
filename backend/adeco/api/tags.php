<?php
// Agregar cabeceras de CORS
header("Access-Control-Allow-Origin: http://localhost:3000"); // Cambia esto al origen de tu frontend
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


header('Content-Type: application/json');
require 'db.php';



try {
    $stmt = $conn->query("
        SELECT u.*, t.* 
        FROM tag t
        LEFT JOIN  dni u ON  t.rfid_id  = u.tag  
       
    ");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($users);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error fetching users']);
    http_response_code(500);
}
?>
