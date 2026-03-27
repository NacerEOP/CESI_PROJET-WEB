<?php

namespace App\Models;

class DbInternshipModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll($limit = 20, $offset = 0)
    {
        $stmt = $this->db->prepare('SELECT i.*, c.CategoryName, co.Name AS CompanyName FROM Internships i JOIN Category c ON i.Id_Category = c.Id_Category JOIN Companies co ON i.IdCompany = co.IdCompany ORDER BY i.IdInternship DESC LIMIT :limit OFFSET :offset');
        $stmt->bindValue(':limit', (int)$limit, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare('SELECT i.*, c.CategoryName, co.Name AS CompanyName FROM Internships i JOIN Category c ON i.Id_Category = c.Id_Category JOIN Companies co ON i.IdCompany = co.IdCompany WHERE i.IdInternship = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function create(array $data)
    {
        $stmt = $this->db->prepare('INSERT INTO Internships (Title, Description, DateOfCreation, Budget, Time_, Id_Category, IdCompany) VALUES (:title, :description, :date, :budget, :time, :category, :company)');
        $stmt->execute([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'date' => $data['date'] ?? date('Y-m-d'),
            'budget' => $data['budget'] ?? 0,
            'time' => $data['time'] ?? 0,
            'category' => $data['category'],
            'company' => $data['company'],
        ]);

        return $this->getById($this->db->lastInsertId());
    }

    public function update($id, array $data)
    {
        $stmt = $this->db->prepare('UPDATE Internships SET Title = :title, Description = :description, DateOfCreation = :date, Budget = :budget, Time_ = :time, Id_Category = :category, IdCompany = :company WHERE IdInternship = :id');
        $stmt->execute([
            'id' => $id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'date' => $data['date'] ?? date('Y-m-d'),
            'budget' => $data['budget'] ?? 0,
            'time' => $data['time'] ?? 0,
            'category' => $data['category'],
            'company' => $data['company'],
        ]);

        return $this->getById($id);
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare('DELETE FROM Internships WHERE IdInternship = :id');
        return $stmt->execute(['id' => $id]);
    }
}
