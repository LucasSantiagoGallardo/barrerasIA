<?php
// Agregar cabeceras de CORS
header("Access-Control-Allow-Origin: http://localhost:3000"); // Cambia esto al origen de tu frontend
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Responde con un 200 OK para solicitudes preflight
    http_response_code(200);
    exit;
}
require 'db.php'; // Conexión a la base de datos
require 'jwt.php'; // Archivo para manejar JWT

// Leer datos enviados en la solicitud
$data = json_decode(file_get_contents('php://input'), true);

$username = $data['username'] ?? null;
$password = $data['password'] ?? null;

if (!$username || !$password) {
    echo json_encode(['error' => 'Username and password are required']);
    http_response_code(400);
    exit;
}

try {
    // Buscar el usuario en la base de datos
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username");
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password'])) {
        echo json_encode(['error' => 'Invalid username or password']);
        http_response_code(401);
        exit;
    }

    // Generar un token JWT
    $token = generateJWT(['id' => $user['id'], 'username' => $user['username']]);

    echo json_encode(['message' => 'Login successful', 'token' => $token]);
    http_response_code(200);
} catch (Exception $e) {
    echo json_encode(['error' => 'Internal server error']);
    http_response_code(500);
}
?>
