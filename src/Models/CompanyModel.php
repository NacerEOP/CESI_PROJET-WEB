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
        $stmt = $this->db->prepare('DELETE FROM Companies WHERE IdCompany = :id');
        return $stmt->execute(['id' => $id]);
    }
}
