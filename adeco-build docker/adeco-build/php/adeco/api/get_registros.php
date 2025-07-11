<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

require_once('db.php');

$sql = "SELECT 
  h1.id,
  h1.timestamp,
  h1.Id_Key AS llave,
  h1.dni,
  h1.barrera,
  h1.resultado,
  d.Name AS nombre,
  d.Last_Name AS apellido,
  d.patente,
  d.Id_Customer,
  c.Name AS empresa
FROM hist h1
LEFT JOIN hist h2
  ON h1.dni = h2.dni AND h1.timestamp < h2.timestamp
LEFT JOIN dni d ON h1.dni = d.Dni
LEFT JOIN customer c ON d.Id_Customer = c.Id_Customer
WHERE h2.id IS NULL
ORDER BY h1.timestamp DESC
LIMIT 1000

";

$result = $conn->query($sql);

$registros = [];
if ($result) {
    while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
     
    
        // Divide la fecha y la hora
        $ts = $row['timestamp'];
        if ($ts && strpos($ts, ' ') !== false) {
            list($fecha, $hora) = explode(' ', $ts, 2);
        } else {
            $fecha = $ts;
            $hora = '';
        }
        $registros[] = [
            "id" => $row['id'],
            "fecha" => $fecha,
            "hora" => $hora,
            "nombre" => $row['nombre'],
            "apellido" => $row['apellido'],
            "dni" => $row['dni'],
            "empresa" => $row['empresa'],
            "llave" => $row['llave'],
            "patente" => $row['patente'],
            "barrera" => $row['barrera'],
            "resultado" => $row['resultado'],
        ];
    }
}

echo json_encode($registros, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
?>
