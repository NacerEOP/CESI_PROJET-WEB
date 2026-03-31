<?php

namespace App\Controllers;

use App\Models\UserModel;
use App\Models\Auth;
use App\Config\AppConfig;

class SignupController extends BaseController
{
    public function index()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $this->processSignup();
        } else {
            $this->showSignupForm();
        }
    }

    private function processSignup()
    {
        $firstName = isset($_POST['firstName']) ? trim($_POST['firstName']) : '';
        $lastName = isset($_POST['lastName']) ? trim($_POST['lastName']) : '';
        $email = isset($_POST['email']) ? trim($_POST['email']) : '';
        $password = isset($_POST['password']) ? $_POST['password'] : '';
        $passwordConfirm = isset($_POST['passwordConfirm']) ? $_POST['passwordConfirm'] : '';
        $dob = isset($_POST['dob']) ? $_POST['dob'] : '';
        $country = isset($_POST['country']) ? $_POST['country'] : 1;
        $role = isset($_POST['role']) ? $_POST['role'] : '';

        if (empty($firstName) || empty($lastName) || empty($email) || empty($password) || empty($passwordConfirm) || empty($dob) || empty($role)) {
            $this->render('signup', array('title' => 'Sign Up', 'error' => 'All fields are required.'));
            return;
        }

        if ($password !== $passwordConfirm) {
            $this->render('signup', array('title' => 'Sign Up', 'error' => 'Passwords do not match.'));
            return;
        }

        if (!in_array($role, ['student', 'pilot'])) {
            $this->render('signup', array('title' => 'Sign Up', 'error' => 'Invalid role selected.'));
            return;
        }

        $userModel = new UserModel();
        if ($userModel->findByEmail($email)) {
            $this->render('signup', array('title' => 'Sign Up', 'error' => 'Email already used.'));
            return;
        }

        $user = $userModel->create(array(
            'firstName' => $firstName,
            'lastName' => $lastName,
            'email' => $email,
            'password' => $password,
            'dob' => $dob,
            'country' => $country,
        ));

        // Create role-specific record
        if ($role === 'student') {
            $this->createStudentRecord($user['IdUser']);
        } elseif ($role === 'pilot') {
            $this->createPilotRecord($user['IdUser']);
        }

        Auth::login($user);
        header('Location: ' . AppConfig::getBasePath() . '/dashboard');
        exit;
    }

    private function showSignupForm()
    {
        $this->render('signup', array('title' => 'Sign Up'));
    }

    private function createStudentRecord($userId)
    {
        $schoolLevel = isset($_POST['schoolLevel']) ? $_POST['schoolLevel'] : 'Bachelor';
        $schoolYear = isset($_POST['schoolYear']) ? (int)$_POST['schoolYear'] : 1;
        $major = isset($_POST['major']) ? trim($_POST['major']) : 'Computer Science';
        $pilotId = isset($_POST['pilot']) ? (int)$_POST['pilot'] : 6; // Default pilot

        $db = \App\Models\Database::getInstance()->getConnection();
        $stmt = $db->prepare('INSERT INTO Student (IdUser_1, SchoolLevel, SchoolYear, Major, IdUser) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$userId, $schoolLevel, $schoolYear, $major, $pilotId]);
    }

    private function createPilotRecord($userId)
    {
        $db = \App\Models\Database::getInstance()->getConnection();
        $stmt = $db->prepare('INSERT INTO Pilot (IdUser) VALUES (?)');
        $stmt->execute([$userId]);
    }
}
