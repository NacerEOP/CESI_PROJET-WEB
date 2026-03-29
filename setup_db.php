<?php

// Database setup script
$host = 'localhost';
$user = 'root';
$pass = '';

try {
    // Connect without database
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create database
    $pdo->exec("DROP DATABASE IF EXISTS find_your_internship");
    $pdo->exec("CREATE DATABASE find_your_internship");
    $pdo->exec("USE find_your_internship");

    echo "Database created successfully.\n";

    // Read and execute CreateDB.sql
    $sql = file_get_contents(__DIR__ . '/DB/CreateDB.sql');
    $pdo->exec($sql);

    echo "Tables created successfully.\n";

    // Read and execute PopulateDB.sql
    $sql = file_get_contents(__DIR__ . '/DB/PopulateDB.sql');
    $pdo->exec($sql);

    echo "Database populated successfully.\n";

} catch (PDOException $e) {
    die("Error: " . $e->getMessage() . "\n");
}

?>