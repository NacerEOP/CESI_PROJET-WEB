<?php

namespace App\Models;

class Auth
{
    public static function startSession()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function login($user)
    {
        self::startSession();
        $_SESSION['user'] = [
            'id' => $user['IdUser'],
            'firstName' => $user['FirstName'],
            'lastName' => $user['LastName'],
            'email' => $user['Email'],
            'role' => self::resolveRole($user),
        ];
    }

    public static function logout()
    {
        self::startSession();
        session_unset();
        session_destroy();
    }

    public static function user()
    {
        self::startSession();
        return $_SESSION['user'] ?? null;
    }

    public static function isLoggedIn()
    {
        return (self::user() !== null);
    }

    public static function hasRole($roles)
    {
        $user = self::user();
        if (!$user) {
            return false;
        }

        if (is_array($roles)) {
            return in_array($user['role'], $roles, true);
        }

        return $user['role'] === $roles;
    }

    private static function resolveRole($user)
    {
        if (isset($user['IdUser']) && self::isAdmin($user['IdUser'])) {
            return 'admin';
        }

        if (isset($user['IdUser']) && self::isPilot($user['IdUser'])) {
            return 'pilot';
        }

        if (isset($user['IdUser']) && self::isStudent($user['IdUser'])) {
            return 'student';
        }

        return 'anonymous';
    }

    public static function isAdmin($idUser)
    {
        $db = Database::getInstance()->getConnection();
        $sql = 'SELECT 1 FROM Admin WHERE IdUser = :id LIMIT 1';
        $stmt = $db->prepare($sql);
        $stmt->execute(['id' => $idUser]);
        return (bool)$stmt->fetch();
    }

    public static function isPilot($idUser)
    {
        $db = Database::getInstance()->getConnection();
        $sql = 'SELECT 1 FROM Pilot WHERE IdUser = :id LIMIT 1';
        $stmt = $db->prepare($sql);
        $stmt->execute(['id' => $idUser]);
        return (bool)$stmt->fetch();
    }

    public static function isStudent($idUser)
    {
        $db = Database::getInstance()->getConnection();
        $sql = 'SELECT 1 FROM Student WHERE IdUser = :id LIMIT 1';
        $stmt = $db->prepare($sql);
        $stmt->execute(['id' => $idUser]);
        return (bool)$stmt->fetch();
    }
}
