<?php

namespace App\Models;

class ApplicationModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getByUser($userId)
    {
        $stmt = $this->db->prepare('
            SELECT a.*, i.Title, i.Description, c.Name as CompanyName
            FROM Application a
            JOIN Internships i ON a.IdInternship = i.IdInternship
            JOIN Companies c ON i.IdCompany = c.IdCompany
            WHERE a.IdUser = :userId
        ');
        $stmt->execute(['userId' => $userId]);
        return $stmt->fetchAll();
    }
}