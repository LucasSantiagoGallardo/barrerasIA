<?php
header("Content-Type: application/json");
/*Public Key:
BKp7h1gnpkdNqmspZ2UO_beFM-59Vly9ciFqx02h5rwGzNs_8qG-q7JY1yRXFYIN6gncwH_AaAYGGd_ngUmG184

Private Key:
HJb1F-Y6rfifpd2z4j5fiWOTCS42Pitm_5T5bBigxLI
*/
// Configurar claves VAPID
$vapidPublicKey = "BKp7h1gnpkdNqmspZ2UO_beFM-59Vly9ciFqx02h5rwGzNs_8qG-q7JY1yRXFYIN6gncwH_AaAYGGd_ngUmG184";
$vapidPrivateKey = "HJb1F-Y6rfifpd2z4j5fiWOTCS42Pitm_5T5bBigxLI";

require 'vendor/autoload.php'; // Asegúrate de instalar la librería web-push-php

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

// Obtener los datos enviados desde el frontend
$data = json_decode(file_get_contents("php://input"), true);
$title = $data['title'] ?? "Título por defecto";
$body = $data['body'] ?? "Mensaje por defecto";

// Suscripción de ejemplo (deberías guardarlas en tu base de datos)
$subscription = [
    'endpoint' => 'ENDPOINT_DE_SUSCRIPCIÓN',
    'keys' => [
        'p256dh' => 'LLAVE_PUBLICA_DE_SUSCRIPCIÓN',
        'auth' => 'LLAVE_AUTH_DE_SUSCRIPCIÓN',
    ],
];

// Crear la instancia de WebPush
$webPush = new WebPush([
    'VAPID' => [
        'subject' => 'mailto:tuemail@example.com',
        'publicKey' => $vapidPublicKey,
        'privateKey' => $vapidPrivateKey,
    ],
]);

// Enviar la notificación
$payload = json_encode([
    'title' => $title,
    'body' => $body,
]);

$result = $webPush->sendNotification(
    new Subscription(
        $subscription['endpoint'],
        $subscription['keys']['p256dh'],
        $subscription['keys']['auth']
    ),
    $payload
);

if ($result->isSuccess()) {
    echo json_encode(["success" => true, "message" => "Notificación enviada."]);
} else {
    echo json_encode(["success" => false, "message" => $result->getReason()]);
}
