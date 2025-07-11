<?php
header('Content-Type: application/json');
require 'db.php';

$dni = $_GET['dni'] ?? null;
$start = $_GET['start'] ?? null;
$end = $_GET['end'] ?? null;

if (!$dni) {
    echo json_encode(['error' => 'DNI is required']);
    exit;
}

try {
    $query = "SELECT Event_Date, Type_Mov, ID_Access_Point, Validation FROM access_hist WHERE Dni = :dni";

    if ($start && $end) {
        $query .= " AND Event_Date BETWEEN :start AND :end";
    }

    $query .= " ORDER BY Event_Date DESC LIMIT 100";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':dni', $dni, PDO::PARAM_STR);

    if ($start && $end) {
        $stmt->bindParam(':start', $start);
        $stmt->bindParam(':end', $end);
    }

    $stmt->execute();
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Generar datos de gráfico
    $chartData = [
        ['name' => 'Barrera 1', 'Entradas' => 10, 'Salidas' => 5],
        ['name' => 'Barrera 2', 'Entradas' => 8, 'Salidas' => 3],
    ];

    // Datos de validación
    $validationStats = [
        ['name' => 'Permitidos', 'value' => 20],
        ['name' => 'Denegados', 'value' => 5],
    ];

    echo json_encode([
        'history' => $history,
        'chartData' => $chartData,
        'validationStats' => $validationStats,
    ]);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error fetching data: ' . $e->getMessage()]);
}
?>
