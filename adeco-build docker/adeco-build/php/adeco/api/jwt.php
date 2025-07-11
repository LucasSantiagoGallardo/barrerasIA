<?php
function generateJWT($payload, $secret = 'emma2018', $expiry = 3600) {
    $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
    $payload['exp'] = time() + $expiry;

    $base64Header = base64_encode($header);
    $base64Payload = base64_encode(json_encode($payload));

    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", $secret, true);
    $base64Signature = base64_encode($signature);

    return "$base64Header.$base64Payload.$base64Signature";
}
?>
