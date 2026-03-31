<?php

namespace App\Models;

class WishListModel
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Get all internships in a student's wish-list
     */
    public function getStudentWishList($studentId)
    {
        $stmt = $this->db->prepare('
            SELECT i.*, c.CategoryName, co.Name AS CompanyName
            FROM WishList w
            JOIN Internships i ON w.IdInternship = i.IdInternship
            JOIN Category c ON i.Id_Category = c.Id_Category
            JOIN Companies co ON i.IdCompany = co.IdCompany
            WHERE w.IdUser = ?
            ORDER BY i.DateOfCreation DESC
        ');
        $stmt->execute([$studentId]);
        return $stmt->fetchAll();
    }

    /**
     * Add an internship to student's wish-list
     */
    public function addToWishList($studentId, $internshipId)
    {
        // Confirm internship exists
        $check = $this->db->prepare('SELECT 1 FROM Internships WHERE IdInternship = ? LIMIT 1');
        $check->execute([$internshipId]);
        if (!$check->fetch()) {
            return ['success' => false, 'message' => 'Internship not found'];
        }

        // Check if already in wish-list
        if ($this->isInWishList($studentId, $internshipId)) {
            return ['success' => false, 'message' => 'Already in wish-list'];
        }

        try {
            $stmt = $this->db->prepare('INSERT INTO WishList (IdInternship, IdUser) VALUES (?, ?)');
            $result = $stmt->execute([$internshipId, $studentId]);
            if ($result) {
                return ['success' => true, 'message' => 'Added to wish-list'];
            } else {
                return ['success' => false, 'message' => 'Failed to add to wish-list'];
            }
        } catch (\PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }

    /**
     * Remove an internship from student's wish-list
     */
    public function removeFromWishList($studentId, $internshipId)
    {
        try {
            $stmt = $this->db->prepare('DELETE FROM WishList WHERE IdInternship = ? AND IdUser = ?');
            $result = $stmt->execute([$internshipId, $studentId]);
            if ($result && $stmt->rowCount() > 0) {
                return ['success' => true, 'message' => 'Removed from wish-list'];
            } else {
                return ['success' => false, 'message' => 'Not in wish-list or failed to remove'];
            }
        } catch (\PDOException $e) {
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }

    /**
     * Check if an internship is in student's wish-list
     */
    public function isInWishList($studentId, $internshipId)
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM WishList WHERE IdInternship = ? AND IdUser = ?');
        $stmt->execute([$internshipId, $studentId]);
        return $stmt->fetchColumn() > 0;
    }

    /**
     * Get wish-list count for a student
     */
    public function getWishListCount($studentId)
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM WishList WHERE IdUser = ?');
        $stmt->execute([$studentId]);
        return $stmt->fetchColumn();
    }
}