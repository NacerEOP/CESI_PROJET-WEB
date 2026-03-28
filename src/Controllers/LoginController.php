<?php

namespace App\Controllers;

use App\Models\UserModel;
use App\Models\Auth;
use App\Config\AppConfig;

class LoginController extends BaseController
{
    public function index()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = trim($_POST['email'] ?? '');
            $password = $_POST['password'] ?? '';

            if ($email === '' || $password === '') {
                $this->render('login', ['title' => 'Login', 'error' => 'All fields are required.']);
                return;
            }

            $userModel = new UserModel();
            $user = $userModel->verifyPassword($email, $password);

            if ($user) {
                Auth::login($user);
                header('Location: ' . AppConfig::getBasePath() . '/dashboard');
                exit;
            }

            $this->render('login', ['title' => 'Login', 'error' => 'Invalid credentials.']);
            return;
        }

        $this->render('login', ['title' => 'Login']);
    }

    public function logout()
    {
        Auth::logout();
        header('Location: ' . AppConfig::getBasePath() . '/login');
        exit;
    }
}
