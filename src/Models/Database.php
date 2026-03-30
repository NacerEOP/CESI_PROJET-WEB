<?php

namespace App\Models;

class Database
{
    private static $instance = null;
    private $connection;

    private function __construct()
    {
        $host = 'localhost';
        $db   = 'find_your_internship';
        $user = 'root';
        $pass = '';
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        $options = [
            \PDO::ATTR_ERRMODE            => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
            \PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        $this->connection = new \PDO($dsn, $user, $pass, $options);
        $this->connection->exec("SET NAMES utf8mb4");
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function getConnection()
    {
        return $this->connection;
    }
}
