<?php

namespace App\Models;

class PilotModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAll()
    {
        $stmt = $this->db->prepare('
            SELECT u.IdUser, u.FirstName, u.LastName, u.Email, u.UserPhone, u.DoB, u.JoinDate, c.CountryName
            FROM Users u
            JOIN Pilot p ON u.IdUser = p.IdUser
            JOIN Countries c ON u.Id_Country = c.Id_Country
            ORDER BY u.LastName, u.FirstName
        ');
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare('
            SELECT u.IdUser, u.FirstName, u.LastName, u.Email, u.UserPhone, u.DoB, u.JoinDate, c.CountryName, u.Id_Country
            FROM Users u
            JOIN Pilot p ON u.IdUser = p.IdUser
            JOIN Countries c ON u.Id_Country = c.Id_Country
            WHERE u.IdUser = ?
        ');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function search($filters = [], $limit = 20, $offset = 0)
    {
        $where = ['p.IdUser = u.IdUser'];
        $params = [];

        if (!empty($filters['query'])) {
            $where[] = '(u.FirstName LIKE ? OR u.LastName LIKE ? OR u.Email LIKE ?)';
            $queryValue = '%' . $filters['query'] . '%';
            $params[] = $queryValue;
            $params[] = $queryValue;
            $params[] = $queryValue;
        }

        $whereClause = 'WHERE ' . implode(' AND ', $where);

        $stmt = $this->db->prepare("
            SELECT u.IdUser, u.FirstName, u.LastName, u.Email, u.UserPhone, u.DoB, u.JoinDate, c.CountryName
            FROM Users u
            JOIN Pilot p ON u.IdUser = p.IdUser
            JOIN Countries c ON u.Id_Country = c.Id_Country
            $whereClause
            ORDER BY u.LastName, u.FirstName
            LIMIT ? OFFSET ?
        ");
        $params[] = (int)$limit;
        $params[] = (int)$offset;
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function count($filters = [])
    {
        $where = ['p.IdUser = u.IdUser'];
        $params = [];

        if (!empty($filters['query'])) {
            $where[] = '(u.FirstName LIKE ? OR u.LastName LIKE ? OR u.Email LIKE ?)';
            $queryValue = '%' . $filters['query'] . '%';
            $params[] = $queryValue;
            $params[] = $queryValue;
            $params[] = $queryValue;
        }

        $whereClause = 'WHERE ' . implode(' AND ', $where);

        $stmt = $this->db->prepare("
            SELECT COUNT(*)
            FROM Users u
            JOIN Pilot p ON u.IdUser = p.IdUser
            $whereClause
        ");
        $stmt->execute($params);
        return (int) $stmt->fetchColumn();
    }

    public function create(array $data)
    {
        // First create the user
        $userModel = new UserModel();
        $user = $userModel->create([
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'email' => $data['email'],
            'password' => $data['password'],
            'phone' => $data['phone'] ?? null,
            'dob' => $data['dob'],
            'country' => $data['country'] ?? 1,
        ]);

        if (!$user) {
            return false;
        }

        // Then add to Pilot table
        $stmt = $this->db->prepare('INSERT INTO Pilot (IdUser) VALUES (?)');
        $stmt->execute([$user['IdUser']]);

        return $this->getById($user['IdUser']);
    }

    public function update($id, array $data)
    {
        $stmt = $this->db->prepare('
            UPDATE Users
            SET FirstName = :firstName, LastName = :lastName, Email = :email,
                UserPhone = :phone, DoB = :dob, Id_Country = :country
            WHERE IdUser = :id
        ');
        $stmt->execute([
            'id' => $id,
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'dob' => $data['dob'],
            'country' => $data['country'],
        ]);

        return $this->getById($id);
    }

    public function delete($id)
    {
        try {
            // Check if user is admin - if so, only remove pilot role
            $db = Database::getInstance()->getConnection();
            $stmt = $db->prepare('SELECT 1 FROM Admin WHERE IdUser = ? LIMIT 1');
            $stmt->execute([$id]);
            $isAdmin = $stmt->fetch();

            if ($isAdmin) {
                // Just remove pilot role
                $stmt = $this->db->prepare('DELETE FROM Pilot WHERE IdUser = ?');
                $result = $stmt->execute([$id]);
                return $result;
            }

            // Start transaction
            $this->db->beginTransaction();

            // Get all student user IDs assigned to this pilot
            $stmt = $this->db->prepare('SELECT IdUser_1 FROM Student WHERE IdUser = ?');
            $stmt->execute([$id]);
            $studentIds = $stmt->fetchAll(\PDO::FETCH_COLUMN);

            if (!empty($studentIds)) {
                // Delete applications for these students
                $placeholders = implode(',', array_fill(0, count($studentIds), '?'));
                $stmt = $this->db->prepare("DELETE FROM Application WHERE IdUser IN ($placeholders)");
                $stmt->execute($studentIds);

                // Delete wishlists for these students
                $stmt = $this->db->prepare("DELETE FROM WishList WHERE IdUser IN ($placeholders)");
                $stmt->execute($studentIds);

                // Delete student assignments
                $stmt = $this->db->prepare('DELETE FROM Student WHERE IdUser = ?');
                $stmt->execute([$id]);
            }

            // Delete pilot ratings
            $stmt = $this->db->prepare('DELETE FROM RatingPilot WHERE IdUser = ?');
            $stmt->execute([$id]);

            // Delete from Pilot table
            $stmt = $this->db->prepare('DELETE FROM Pilot WHERE IdUser = ?');
            $stmt->execute([$id]);

            // Delete from Users table
            $stmt = $this->db->prepare('DELETE FROM Users WHERE IdUser = ?');
            $result = $stmt->execute([$id]);

            // Commit transaction
            $this->db->commit();

            return $result;
        } catch (\PDOException $e) {
            // Rollback on error
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            throw $e;
        }
    }

    public function getStudentsCount($pilotId)
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM Student WHERE IdUser = ?');
        $stmt->execute([$pilotId]);
        return (int) $stmt->fetchColumn();
    }
}