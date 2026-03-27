<?php

namespace App\Models;

class UserModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function findByEmail($email)
    {
        $stmt = $this->db->prepare('SELECT * FROM Users WHERE Email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        return $stmt->fetch();
    }

    public function findById($id)
    {
        $stmt = $this->db->prepare('SELECT * FROM Users WHERE IdUser = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function create(array $data)
    {
        $stmt = $this->db->prepare('INSERT INTO Users (FirstName, LastName, Email, Password, UserPhone, DoB, JoinDate, Id_Country) VALUES (:firstName, :lastName, :email, :password, :phone, :dob, :joinDate, :country)');
        $stmt->execute([
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'email' => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
            'phone' => $data['phone'] ?? null,
            'dob' => $data['dob'],
            'joinDate' => date('Y-m-d'),
            'country' => $data['country'] ?? 1,
        ]);
        return $this->findById($this->db->lastInsertId());
    }

    public function verifyPassword($email, $password)
    {
        $user = $this->findByEmail($email);
        if (!$user) {
            return false;
        }

        // Support both bcrypt hashes and plain text passwords (for backward compatibility)
        if (strpos($user['Password'], '$2y$') === 0) {
            // It's a bcrypt hash
            return password_verify($password, $user['Password']) ? $user : false;
        } else {
            // Plain text password (backward compatibility)
            return $password === $user['Password'] ? $user : false;
        }
    }

    public function getStudentsByPilot($pilotId)
    {
        $stmt = $this->db->prepare('
            SELECT u.* FROM Users u
            JOIN Student s ON u.IdUser = s.IdUser_1
            WHERE s.IdUser = :pilotId
        ');
        $stmt->execute(['pilotId' => $pilotId]);
        return $stmt->fetchAll();
    }

    public function getTotalUsers()
    {
        $stmt = $this->db->query('SELECT COUNT(*) as total FROM Users');
        return $stmt->fetch()['total'];
    }
}
