<?php

namespace App\Models;

class CompanyModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll()
    {
        $stmt = $this->db->prepare('SELECT c.*, co.CountryName FROM Companies c JOIN Countries co ON c.Id_Country = co.Id_Country');
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare('SELECT c.*, co.CountryName FROM Companies c JOIN Countries co ON c.Id_Country = co.Id_Country WHERE c.IdCompany = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function create(array $data)
    {
        $stmt = $this->db->prepare('INSERT INTO Companies (Name, Description, Email, Phone, Id_Country) VALUES (:name, :description, :email, :phone, :country)');
        $stmt->execute([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'country' => $data['country'],
        ]);
        return $this->getById($this->db->lastInsertId());
    }

    public function update($id, array $data)
    {
        $stmt = $this->db->prepare('UPDATE Companies SET Name = :name, Description = :description, Email = :email, Phone = :phone, Id_Country = :country WHERE IdCompany = :id');
        $stmt->execute([
            'id' => $id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'country' => $data['country'],
        ]);

        return $this->getById($id);
    }

    public function delete($id)
    {
        try {
            // Start transaction
            $this->db->beginTransaction();

            // Delete ratings for this company
            $stmt = $this->db->prepare('DELETE FROM RatingAdmin WHERE IdCompany = :id');
            $stmt->execute(['id' => $id]);

            $stmt = $this->db->prepare('DELETE FROM RatingPilot WHERE IdCompany = :id');
            $stmt->execute(['id' => $id]);

            // Get all internships for this company
            $stmt = $this->db->prepare('SELECT IdInternship FROM Internships WHERE IdCompany = :id');
            $stmt->execute(['id' => $id]);
            $internships = $stmt->fetchAll(\PDO::FETCH_COLUMN);

            // Delete applications and wishlists for these internships
            foreach ($internships as $internshipId) {
                $stmt = $this->db->prepare('DELETE FROM Application WHERE IdInternship = :id');
                $stmt->execute(['id' => $internshipId]);

                $stmt = $this->db->prepare('DELETE FROM WishList WHERE IdInternship = :id');
                $stmt->execute(['id' => $internshipId]);
            }

            // Delete internships for this company
            $stmt = $this->db->prepare('DELETE FROM Internships WHERE IdCompany = :id');
            $stmt->execute(['id' => $id]);

            // Finally delete the company
            $stmt = $this->db->prepare('DELETE FROM Companies WHERE IdCompany = :id');
            $result = $stmt->execute(['id' => $id]);

            // Commit transaction
            $this->db->commit();

            return $result;
        } catch (\PDOException $e) {
            // Rollback on error
            $this->db->rollBack();
            throw $e;
        }
    }
}
