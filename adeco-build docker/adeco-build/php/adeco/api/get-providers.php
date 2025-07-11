<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
require 'db.php';

try {
    $stmt = $conn->query("SELECT * FROM providers");
    $providers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($providers);
} catch (Exception $e) {
    echo json_encode([
        "estado" => "error",
        "mensaje" => $e->getMessage()
    ]);
}
