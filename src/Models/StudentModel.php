<?php

namespace App\Models;

class StudentModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll()
    {
        $stmt = $this->db->prepare('
            SELECT u.*, s.SchoolLevel, s.SchoolYear, s.Major, p.FirstName as PilotFirstName, p.LastName as PilotLastName
            FROM Users u
            JOIN Student s ON u.IdUser = s.IdUser_1
            LEFT JOIN Users p ON s.IdUser = p.IdUser
        ');
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function search($filters, $limit = 100, $offset = 0)
    {
        $query = '
            SELECT u.*, s.SchoolLevel, s.SchoolYear, s.Major, p.FirstName as PilotFirstName, p.LastName as PilotLastName
            FROM Users u
            JOIN Student s ON u.IdUser = s.IdUser_1
            LEFT JOIN Users p ON s.IdUser = p.IdUser
            WHERE 1=1
        ';
        $params = [];

        if (!empty($filters['query'])) {
            $query .= ' AND (u.FirstName LIKE :queryFirstName OR u.LastName LIKE :queryLastName OR u.Email LIKE :queryEmail)';
            $params['queryFirstName'] = '%' . $filters['query'] . '%';
            $params['queryLastName'] = '%' . $filters['query'] . '%';
            $params['queryEmail'] = '%' . $filters['query'] . '%';
        }

        if (!empty($filters['pilotId'])) {
            $query .= ' AND s.IdUser = :pilotId';
            $params['pilotId'] = $filters['pilotId'];
        }

        $query .= ' ORDER BY u.LastName, u.FirstName LIMIT ' . (int)$limit . ' OFFSET ' . (int)$offset;

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function findById($id)
    {
        $stmt = $this->db->prepare('
            SELECT u.*, s.SchoolLevel, s.SchoolYear, s.Major, s.IdUser as PilotId, p.FirstName as PilotFirstName, p.LastName as PilotLastName
            FROM Users u
            JOIN Student s ON u.IdUser = s.IdUser_1
            LEFT JOIN Users p ON s.IdUser = p.IdUser
            WHERE u.IdUser = :id
        ');
        $stmt->execute(['id' => $id]);
        return $stmt->fetch();
    }

    public function create(array $data)
    {
        // First create the user
        $userModel = new UserModel();
        $userData = [
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'email' => $data['email'],
            'password' => $data['password'] ?? 'defaultpassword', // Should generate or ask for password
            'phone' => $data['phone'] ?? null,
            'dob' => $data['dob'] ?? date('Y-m-d', strtotime('-18 years')), // Default 18 years ago
            'country' => $data['country'] ?? 1,
        ];
        $user = $userModel->create($userData);

        // Then create the student record
        $stmt = $this->db->prepare('INSERT INTO Student (IdUser_1, SchoolLevel, SchoolYear, Major, IdUser) VALUES (:idUser, :schoolLevel, :schoolYear, :major, :pilotId)');
        $stmt->execute([
            'idUser' => $user['IdUser'],
            'schoolLevel' => $data['schoolLevel'] ?? null,
            'schoolYear' => $data['schoolYear'] ?? null,
            'major' => $data['major'] ?? null,
            'pilotId' => $data['pilotId'],
        ]);

        return $this->findById($user['IdUser']);
    }

    public function update($id, array $data)
    {
        // Basic validation
        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new \Exception('Invalid email format');
        }
        if (isset($data['firstName']) && empty(trim($data['firstName']))) {
            throw new \Exception('First name cannot be empty');
        }
        if (isset($data['lastName']) && empty(trim($data['lastName']))) {
            throw new \Exception('Last name cannot be empty');
        }

        // Update user data
        $userFields = [];
        $userParams = ['id' => $id];

        if (isset($data['firstName'])) {
            $userFields[] = 'FirstName = :firstName';
            $userParams['firstName'] = $data['firstName'];
        }
        if (isset($data['lastName'])) {
            $userFields[] = 'LastName = :lastName';
            $userParams['lastName'] = $data['lastName'];
        }
        if (isset($data['email'])) {
            // Check if email is already taken by another user
            $stmt = $this->db->prepare('SELECT IdUser FROM Users WHERE Email = :email AND IdUser != :id');
            $stmt->execute(['email' => $data['email'], 'id' => $id]);
            if ($stmt->fetch()) {
                throw new \Exception('Email already exists');
            }
            $userFields[] = 'Email = :email';
            $userParams['email'] = $data['email'];
        }
        if (isset($data['phone'])) {
            $userFields[] = 'UserPhone = :phone';
            $userParams['phone'] = $data['phone'];
        }
        if (isset($data['dob'])) {
            $userFields[] = 'DoB = :dob';
            $userParams['dob'] = $data['dob'];
        }
        if (isset($data['country'])) {
            $userFields[] = 'Id_Country = :country';
            $userParams['country'] = $data['country'];
        }

        if (!empty($userFields)) {
            $sql = 'UPDATE Users SET ' . implode(', ', $userFields) . ' WHERE IdUser = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->execute($userParams);
        }

        // Update student data
        $studentFields = [];
        $studentParams = ['id' => $id];

        if (isset($data['schoolLevel'])) {
            $studentFields[] = 'SchoolLevel = :schoolLevel';
            $studentParams['schoolLevel'] = $data['schoolLevel'];
        }
        if (isset($data['schoolYear'])) {
            $studentFields[] = 'SchoolYear = :schoolYear';
            $studentParams['schoolYear'] = $data['schoolYear'];
        }
        if (isset($data['major'])) {
            $studentFields[] = 'Major = :major';
            $studentParams['major'] = $data['major'];
        }
        if (isset($data['pilotId'])) {
            $studentFields[] = 'IdUser = :pilotId';
            $studentParams['pilotId'] = $data['pilotId'];
        }

        if (!empty($studentFields)) {
            $sql = 'UPDATE Student SET ' . implode(', ', $studentFields) . ' WHERE IdUser_1 = :id';
            $stmt = $this->db->prepare($sql);
            $stmt->execute($studentParams);
        }

        return $this->findById($id);
    }

    public function delete($id)
    {
        // Delete applications first
        $stmt = $this->db->prepare('DELETE FROM Application WHERE IdUser = :id');
        $stmt->execute(['id' => $id]);

        // Delete wishlist entries
        $stmt = $this->db->prepare('DELETE FROM WishList WHERE IdUser = :id');
        $stmt->execute(['id' => $id]);

        // Delete from Student
        $stmt = $this->db->prepare('DELETE FROM Student WHERE IdUser_1 = :id');
        $stmt->execute(['id' => $id]);

        // Delete from Users
        $stmt = $this->db->prepare('DELETE FROM Users WHERE IdUser = :id');
        $stmt->execute(['id' => $id]);

        return true;
    }

    public function getPilots()
    {
        $stmt = $this->db->prepare('SELECT u.IdUser, u.FirstName, u.LastName FROM Users u JOIN Pilot p ON u.IdUser = p.IdUser');
        $stmt->execute();
        return $stmt->fetchAll();
    }
}