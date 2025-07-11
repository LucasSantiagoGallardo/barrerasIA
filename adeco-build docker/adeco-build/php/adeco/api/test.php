<?php
require 'db.php';

$username = 'admin';
$password = 'password';

 $hash ='$2y$10$EsmDefv9bKlAp1IcGsVeKegEzmBZGr8zwCvJCktUvkqNbwtdE4R.y';


 if (password_verify($password, $hash)) {
    echo "Contraseña válida";
} else {
    echo "Contraseña incorrecta";
}

echo password_hash("password", PASSWORD_BCRYPT);

?>

