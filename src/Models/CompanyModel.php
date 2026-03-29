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
        $stmt = $this->db->prepare('SELECT c.*, co.CountryName FROM Companies c JOIN Countries co ON c.Id_Country = co.Id_Country WHERE c.IdCompany = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getDetailedById($id)
    {
        $company = $this->getById($id);
        if (!$company) return null;

        // Number of applicants: sum of applications for all internships of this company
        $stmt = $this->db->prepare('SELECT COUNT(a.IdUser) FROM Application a JOIN Internships i ON a.IdInternship = i.IdInternship WHERE i.IdCompany = ?');
        $stmt->execute([$id]);
        $company['applicant_count'] = $stmt->fetchColumn();

        // Average rating: combine admin and pilot ratings
        $stmt = $this->db->prepare('SELECT AVG(rating) FROM (SELECT Rating AS rating FROM RatingAdmin WHERE IdCompany = ? UNION ALL SELECT Rating FROM RatingPilot WHERE IdCompany = ?) AS ratings');
        $stmt->execute([$id, $id]);
        $company['avg_rating'] = round($stmt->fetchColumn(), 2);

        // Related offers
        $stmt = $this->db->prepare('SELECT IdInternship, Title FROM Internships WHERE IdCompany = ?');
        $stmt->execute([$id]);
        $company['offers'] = $stmt->fetchAll();

        // Ratings details
        $stmt = $this->db->prepare('SELECT ra.Rating, ra.RatingText, "admin" as type FROM RatingAdmin ra WHERE ra.IdCompany = ? UNION ALL SELECT rp.Rating, rp.RatingText, "pilot" as type FROM RatingPilot rp WHERE rp.IdCompany = ?');
        $stmt->execute([$id, $id]);
        $company['ratings'] = $stmt->fetchAll();

        return $company;
    }

    public function search($filters = [], $limit = 20, $offset = 0)
    {
        $where = [];
        $params = [];

        if (!empty($filters['query'])) {
            $where[] = '(c.Name LIKE ? OR c.Description LIKE ?)';
            $queryValue = '%' . $filters['query'] . '%';
            $params[] = $queryValue;
            $params[] = $queryValue;
        }

        if (!empty($filters['country'])) {
            $where[] = 'c.Id_Country = ?';
            $params[] = $filters['country'];
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $orderBy = 'c.IdCompany DESC';
        if (!empty($filters['sort'])) {
            switch ($filters['sort']) {
                case 'title_asc': $orderBy = 'c.Name ASC'; break;
                case 'title_desc': $orderBy = 'c.Name DESC'; break;
                default: $orderBy = 'c.IdCompany DESC';
            }
        }

        $stmt = $this->db->prepare("SELECT c.*, co.CountryName FROM Companies c JOIN Countries co ON c.Id_Country = co.Id_Country $whereClause ORDER BY $orderBy LIMIT ? OFFSET ?");
        $params[] = (int)$limit;
        $params[] = (int)$offset;
        $stmt->execute($params);
        return $stmt->fetchAll();
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

            if (count($internships) > 0) {
                // Delete dependent data for internships in bulk to avoid fk constraint failures
                $placeholders = implode(',', array_fill(0, count($internships), '?'));

                $stmt = $this->db->prepare("DELETE FROM InternshipSkillNeeds WHERE IdInternship IN ($placeholders)");
                $stmt->execute($internships);

                $stmt = $this->db->prepare("DELETE FROM Application WHERE IdInternship IN ($placeholders)");
                $stmt->execute($internships);

                $stmt = $this->db->prepare("DELETE FROM WishList WHERE IdInternship IN ($placeholders)");
                $stmt->execute($internships);
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
