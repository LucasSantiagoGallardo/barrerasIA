<?php
$output = shell_exec("uvicorn main:app --reload --host 0.0.0.0 --port 8003 C:\adeco\python\adeco\nuevacore> 2>&1 ");
echo $output;

?>
