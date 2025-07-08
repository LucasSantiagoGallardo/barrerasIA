<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); // Cambia al dominio correcto
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$arduinoIp = "192.168.182.48"; // IP del Arduino
$ledAction = $_GET['action'] ?? null;

if ($ledAction) {
    $url = "http://$arduinoIp/led/$ledAction";

    try {
        $response = file_get_contents($url);

        // Decodificar el JSON del Arduino si aplica
        $decodedResponse = json_decode($response, true);

        echo json_encode([
            "status" => "success",
            "message" => "Petición enviada al Arduino",
            "action" => $ledAction,
            "response" => $decodedResponse ?? $response
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "status" => "error",
            "message" => "Error al conectar con el Arduino.",
            "error" => $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Acción no especificada. Usa 'on', 'off' o 'state'."
    ]);
}
?>
