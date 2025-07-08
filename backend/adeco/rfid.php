<?php
$packet = pack('C*', 0x7C, 0xFF, 0xFF, 0xD7, 0x00, 0x02, 0x02, 0x01, 0xAA);
$packet_base64 = base64_encode($packet);

$ch = curl_init('http://192.168.2.200:49152');
curl_setopt($ch, CURLOPT_POSTFIELDS, $packet_base64);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/octet-stream'));
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>