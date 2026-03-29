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

    public function apply($internshipId, $userId)
    {
        // Check if already applied
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM Application WHERE IdInternship = :internshipId AND IdUser = :userId');
        $stmt->execute(['internshipId' => $internshipId, 'userId' => $userId]);
        if ($stmt->fetchColumn() > 0) {
            return false; // Already applied
        }
        $stmt = $this->db->prepare('INSERT INTO Application (IdInternship, IdUser) VALUES (:internshipId, :userId)');
        return $stmt->execute(['internshipId' => $internshipId, 'userId' => $userId]);
    }

    public function getByPilot($pilotId)
    {
        $stmt = $this->db->prepare('
            SELECT a.*, i.Title, i.Description, c.Name as CompanyName, u.FirstName, u.LastName
            FROM Application a
            JOIN Internships i ON a.IdInternship = i.IdInternship
            JOIN Companies c ON i.IdCompany = c.IdCompany
            JOIN Student s ON a.IdUser = s.IdUser_1
            JOIN Users u ON s.IdUser_1 = u.IdUser
            WHERE s.IdUser = :pilotId
        ');
        $stmt->execute(['pilotId' => $pilotId]);
        return $stmt->fetchAll();
    }
}