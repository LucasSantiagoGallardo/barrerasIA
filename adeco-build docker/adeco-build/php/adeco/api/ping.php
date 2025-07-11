<?php
header('Content-Type: application/json');
require 'db.php';

try {
    // Confirmar conexión
    $dbName = $conn->query("SELECT DATABASE()")->fetchColumn();

    // Verificar cuántas filas hay en la tabla providers
    $count = $conn->query("SELECT COUNT(*) FROM providers")->fetchColumn();

    echo json_encode([
        "estado" => "ok",
        "base_de_datos" => $dbName,
        "proveedores_encontrados" => intval($count)
    ]);
} catch (Exception $e) {
    echo json_encode([
        "estado" => "error",
        "mensaje" => $e->getMessage()
    ]);
}
?>
