<?php
$name = $_POST['name'];
$skill = $_POST['skill'];

$file = fopen("skills.txt", "a");
fwrite($file, $name . " teaches " . $skill . "\n");
fclose($file);

echo "Skill added successfully!";
?>
