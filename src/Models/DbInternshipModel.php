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
        $stmt = $this->db->prepare('SELECT i.*, c.CategoryName, co.Name AS CompanyName FROM Internships i JOIN Category c ON i.Id_Category = c.Id_Category JOIN Companies co ON i.IdCompany = co.IdCompany WHERE i.IdInternship = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getDetailedById($id)
    {
        $internship = $this->getById($id);
        if (!$internship) return null;

        // Get skills
        $stmt = $this->db->prepare('SELECT s.Skill FROM Skills s JOIN InternshipSkillNeeds isn ON s.IdSkills = isn.IdSkills WHERE isn.IdInternship = ?');
        $stmt->execute([$id]);
        $internship['skills'] = $stmt->fetchAll(\PDO::FETCH_COLUMN);

        // Get number of applicants
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM Application WHERE IdInternship = ?');
        $stmt->execute([$id]);
        $internship['applicant_count'] = $stmt->fetchColumn();

        return $internship;
    }

    public function search($filters = [], $limit = 20, $offset = 0)
    {
        $where = [];
        $params = [];

        if (!empty($filters['query'])) {
            $where[] = '(i.Title LIKE ? OR i.Description LIKE ? OR co.Name LIKE ?)';
            $queryValue = '%' . $filters['query'] . '%';
            $params[] = $queryValue;
            $params[] = $queryValue;
            $params[] = $queryValue;
        }

        if (!empty($filters['skills'])) {
            $skillIds = $filters['skills'];
            $placeholders = str_repeat('?,', count($skillIds) - 1) . '?';
            $where[] = "i.IdInternship IN (SELECT IdInternship FROM InternshipSkillNeeds WHERE IdSkills IN ($placeholders))";
            $params = array_merge($params, $skillIds);
        }

        if (!empty($filters['category'])) {
            $where[] = 'i.Id_Category = ?';
            $params[] = $filters['category'];
        }

        if (!empty($filters['company'])) {
            $where[] = 'i.IdCompany = ?';
            $params[] = $filters['company'];
        }

        if (!empty($filters['budget_min'])) {
            $where[] = 'i.Budget >= ?';
            $params[] = $filters['budget_min'];
        }

        if (!empty($filters['budget_max'])) {
            $where[] = 'i.Budget <= ?';
            $params[] = $filters['budget_max'];
        }

        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

        $orderBy = 'i.IdInternship DESC';
        if (!empty($filters['sort'])) {
            switch ($filters['sort']) {
                case 'date_desc': $orderBy = 'i.DateOfCreation DESC'; break;
                case 'date_asc': $orderBy = 'i.DateOfCreation ASC'; break;
                case 'title_asc': $orderBy = 'i.Title ASC'; break;
                case 'title_desc': $orderBy = 'i.Title DESC'; break;
            }
        }

        $stmt = $this->db->prepare("SELECT i.*, c.CategoryName, co.Name AS CompanyName FROM Internships i JOIN Category c ON i.Id_Category = c.Id_Category JOIN Companies co ON i.IdCompany = co.IdCompany $whereClause ORDER BY $orderBy LIMIT ? OFFSET ?");
        $params[] = (int)$limit;
        $params[] = (int)$offset;
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getStats()
    {
        $stats = [];

        // Répartition des offres par durée de stage
        $stmt = $this->db->prepare('SELECT Time_, COUNT(*) as count FROM Internships GROUP BY Time_ ORDER BY Time_');
        $stmt->execute();
        $stats['duration_distribution'] = $stmt->fetchAll(\PDO::FETCH_KEY_PAIR);

        // Top des offres les plus ajoutées en wish-list
        $stmt = $this->db->prepare('SELECT i.Title, COUNT(w.IdUser) as wish_count FROM Internships i LEFT JOIN WishList w ON i.IdInternship = w.IdInternship GROUP BY i.IdInternship ORDER BY wish_count DESC LIMIT 10');
        $stmt->execute();
        $stats['top_wishlist'] = $stmt->fetchAll();

        // Nombre total d'offres disponibles
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM Internships');
        $stmt->execute();
        $stats['total_offers'] = $stmt->fetchColumn();

        // Nombre moyen de candidatures par offre
        $stmt = $this->db->prepare('SELECT AVG(app_count) FROM (SELECT COUNT(*) as app_count FROM Application GROUP BY IdInternship) as sub');
        $stmt->execute();
        $stats['avg_applications'] = round($stmt->fetchColumn(), 2);

        return $stats;
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

        $id = $this->db->lastInsertId();

        // Add skills
        if (!empty($data['skills']) && is_array($data['skills'])) {
            $this->setSkills($id, $data['skills']);
        }

        return $this->getById($id);
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

        // Update skills
        if (isset($data['skills']) && is_array($data['skills'])) {
            $this->setSkills($id, $data['skills']);
        }

        return $this->getById($id);
    }

    private function setSkills($internshipId, array $skillIds)
    {
        // Delete existing
        $stmt = $this->db->prepare('DELETE FROM InternshipSkillNeeds WHERE IdInternship = :id');
        $stmt->execute(['id' => $internshipId]);

        // Insert new
        if (!empty($skillIds)) {
            $stmt = $this->db->prepare('INSERT INTO InternshipSkillNeeds (IdInternship, IdSkills) VALUES (:internship, :skill)');
            foreach ($skillIds as $skillId) {
                $stmt->execute(['internship' => $internshipId, 'skill' => $skillId]);
            }
        }
    }

    public function delete($id)
    {
        $stmt = $this->db->prepare('DELETE FROM Internships WHERE IdInternship = :id');
        return $stmt->execute(['id' => $id]);
    }
}
