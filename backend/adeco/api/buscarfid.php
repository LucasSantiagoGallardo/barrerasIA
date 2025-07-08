<?php
// Permitir solicitudes desde cualquier origen y configuraciones CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

$host = 'localhost';
$db = 'adeco';
$user = 'root';
$password = '';

// Conexión a la base de datos
try {
    $conn = new PDO("mysql:host=$host;dbname=$db", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode([
        "status" => "error",
        "message" => "Error al conectar con la base de datos",
        "error" => $e->getMessage()
    ]));
}

// Verificar si es una solicitud POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Leer el cuerpo de la solicitud
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['dni']) || !isset($input['action']) || !isset($input['barrera'])) {
        echo json_encode([
            "status" => "error",
            "message" => "Faltan parámetros 'dni', 'action' o 'barrera'"
        ]);
        exit;
    }

    $dni = $input['dni'];
    $action = $input['action']; // 'on' o 'off'
    $barrera = $input['barrera'];

    // Validar el DNI en la base de datos
    try {
        $stmt = $conn->prepare("SELECT `Id_Key`, `Dni` FROM `dni` WHERE `Id_Key` = :dni");
        $stmt->bindParam(':dni', $dni);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            // Si el DNI es válido, realizar la solicitud al Arduino
            $arduinoUrl = "http://192.168.0.50/led/" . $action;

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $arduinoUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            $arduinoResponse = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200) {
                echo json_encode([
                    "status" => "success",
                    "message" => "Acción ejecutada correctamente",
                    "action" => $action,
                    "arduinoResponse" => $arduinoResponse
                ]);

                // Si la acción es "on", programar la solicitud de "off" en 30 segundos
                if ($action === "on") {
                    sleep(30); // Esperar 30 segundos

                    // Enviar la acción "off" al Arduino
                    $offUrl = "http://192.168.0.50/led/off";
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $offUrl);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
                    $offResponse = curl_exec($ch);
                    $offHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    curl_close($ch);

                    // Insertar en la tabla de historial
                    $insertStmt = $conn->prepare("INSERT INTO `hist` (`Id_Key`, `dni`, `barrera`, `estado`) VALUES (:id_key, :dni, :barrera, 'permitido')");
                    $insertStmt->bindParam(':id_key', $dni);
                    $insertStmt->bindParam(':dni', $result['Dni']);
                    $insertStmt->bindParam(':barrera', $barrera);
                    $insertStmt->execute();

                    // Log de la segunda solicitud
                    file_put_contents('arduino_log.txt', "Petición OFF: Código HTTP $offHttpCode, Respuesta: $offResponse\n", FILE_APPEND);
                }
            } else {
                echo json_encode([
                    "status" => "error",
                    "message" => "Error al comunicarse con el Arduino",
                    "httpCode" => $httpCode
                ]);
            }
        } else {
            // Si el DNI no es válido
            $noRegistrado = "no registrado";
            $insertStmt = $conn->prepare("INSERT INTO `hist` (`Id_Key`, `dni`, `barrera`, `estado`) VALUES (:id_key, :dni, :barrera, 'No permitido')");
            $insertStmt->bindParam(':id_key', $dni);
            $insertStmt->bindParam(':dni', $noRegistrado);
            $insertStmt->bindParam(':barrera', $barrera);
            $insertStmt->execute();

            echo json_encode([
                "status" => "error",
                "message" => "DNI no registrado"
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            "status" => "error",
            "message" => "Error al consultar la base de datos",
            "error" => $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Método no permitido"
    ]);
}
?>
