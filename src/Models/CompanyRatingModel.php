<?php

namespace App\Models;

use PDO;

class CompanyRatingModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Save or update a rating for a company
     * @param int $companyId
     * @param int $userId
     * @param int $rating (1-5)
     * @param string $ratingText
     * @param string $userRole ('admin' or 'pilot')
     * @return array|false
     */
    public function saveRating($companyId, $userId, $rating, $ratingText, $userRole)
    {
        if (!in_array($userRole, ['admin', 'pilot'])) {
            return false;
        }

        $tableName = $userRole === 'admin' ? 'RatingAdmin' : 'RatingPilot';

        // Check if rating already exists
        $stmt = $this->db->prepare("SELECT 1 FROM $tableName WHERE IdCompany = :company_id AND IdUser = :user_id");
        $stmt->execute([':company_id' => $companyId, ':user_id' => $userId]);
        $exists = $stmt->fetch() !== false;

        if ($exists) {
            // Update existing rating
            $stmt = $this->db->prepare(
                "UPDATE $tableName SET Rating = :rating, RatingText = :text WHERE IdCompany = :company_id AND IdUser = :user_id"
            );
        } else {
            // Insert new rating
            $stmt = $this->db->prepare(
                "INSERT INTO $tableName (IdCompany, IdUser, Rating, RatingText) VALUES (:company_id, :user_id, :rating, :text)"
            );
        }

        $result = $stmt->execute([
            ':company_id' => $companyId,
            ':user_id' => $userId,
            ':rating' => $rating,
            ':text' => $ratingText,
        ]);

        if ($result) {
            return $this->getRating($companyId, $userId, $userRole);
        }

        return false;
    }

    /**
     * Get a user's rating for a company
     * @param int $companyId
     * @param int $userId
     * @param string $userRole ('admin' or 'pilot')
     * @return array|null
     */
    public function getRating($companyId, $userId, $userRole)
    {
        if (!in_array($userRole, ['admin', 'pilot'])) {
            return null;
        }

        $tableName = $userRole === 'admin' ? 'RatingAdmin' : 'RatingPilot';

        $stmt = $this->db->prepare(
            "SELECT IdCompany, IdUser, Rating, RatingText FROM $tableName WHERE IdCompany = :company_id AND IdUser = :user_id"
        );
        $stmt->execute([':company_id' => $companyId, ':user_id' => $userId]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get average rating for a company
     * @param int $companyId
     * @return float|null
     */
    public function getAverageRating($companyId)
    {
        // Get all ratings from both admin and pilot tables combined
        $stmt = $this->db->prepare(
            'SELECT AVG(Rating) as avg_rating FROM (
                SELECT Rating FROM RatingAdmin WHERE IdCompany = ?
                UNION ALL
                SELECT Rating FROM RatingPilot WHERE IdCompany = ?
            ) as combined_ratings'
        );
        $stmt->execute([$companyId, $companyId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result['avg_rating'] !== null ? floatval($result['avg_rating']) : null;
    }

    /**
     * Get all ratings for a company
     * @param int $companyId
     * @return array
     */
    public function getCompanyRatings($companyId)
    {
        // Get admin ratings
        $stmt = $this->db->prepare(
            'SELECT r.IdCompany, r.IdUser, r.Rating, r.RatingText, u.FirstName, u.LastName, "Admin" as UserRole
             FROM RatingAdmin r
             JOIN Admin a ON r.IdUser = a.IdUser
             JOIN Users u ON a.IdUser = u.IdUser
             WHERE r.IdCompany = :id
             ORDER BY r.Rating DESC'
        );
        $stmt->execute([':id' => $companyId]);
        $adminRatings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get pilot ratings
        $stmt = $this->db->prepare(
            'SELECT r.IdCompany, r.IdUser, r.Rating, r.RatingText, u.FirstName, u.LastName, "Pilot" as UserRole
             FROM RatingPilot r
             JOIN Pilot p ON r.IdUser = p.IdUser
             JOIN Users u ON p.IdUser = u.IdUser
             WHERE r.IdCompany = :id
             ORDER BY r.Rating DESC'
        );
        $stmt->execute([':id' => $companyId]);
        $pilotRatings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_merge($adminRatings, $pilotRatings);
    }

    /**
     * Get count of ratings for a company
     * @param int $companyId
     * @return int
     */
    public function getRatingCount($companyId)
    {
        $stmt = $this->db->prepare(
            'SELECT COUNT(*) as total FROM (
                SELECT IdCompany FROM RatingAdmin WHERE IdCompany = ?
                UNION ALL
                SELECT IdCompany FROM RatingPilot WHERE IdCompany = ?
             ) as combined_ratings'
        );
        $stmt->execute([$companyId, $companyId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return intval($result['total']);
    }

    /**
     * Delete a rating
     * @param int $companyId
     * @param int $userId
     * @param string $userRole
     * @return bool
     */
    public function deleteRating($companyId, $userId, $userRole)
    {
        if (!in_array($userRole, ['admin', 'pilot'])) {
            return false;
        }

        $tableName = $userRole === 'admin' ? 'RatingAdmin' : 'RatingPilot';

        $stmt = $this->db->prepare(
            "DELETE FROM $tableName WHERE IdCompany = :company_id AND IdUser = :user_id"
        );

        return $stmt->execute([':company_id' => $companyId, ':user_id' => $userId]);
    }
}
