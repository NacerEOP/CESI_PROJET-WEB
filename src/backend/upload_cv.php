<?php

$uploadDir = "../uploads/";

if(!isset($_FILES["cv"])) {
    die("No file uploaded.");
}

$file = $_FILES["cv"];

$allowedTypes = ["pdf","doc","docx"];
$maxSize = 5 * 1024 * 1024; // 5MB

$fileName = basename($file["name"]);
$fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

if(!in_array($fileExt,$allowedTypes)){
    die("Invalid file type.");
}

if($file["size"] > $maxSize){
    die("File too large.");
}

$newName = uniqid("cv_",true) . "." . $fileExt;

$targetFile = $uploadDir . $newName;

if(move_uploaded_file($file["tmp_name"], $targetFile)){
    echo "Application submitted successfully.";
} else {
    echo "Upload failed.";
}

?>