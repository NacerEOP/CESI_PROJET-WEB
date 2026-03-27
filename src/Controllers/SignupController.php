<?php

namespace App\Controllers;

use App\Models\UserModel;
use App\Models\Auth;

class SignupController extends BaseController
{
    public function index()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $firstName = trim($_POST['firstName'] ?? '');
            $lastName = trim($_POST['lastName'] ?? '');
            $email = trim($_POST['email'] ?? '');
            $password = $_POST['password'] ?? '';
            $passwordConfirm = $_POST['passwordConfirm'] ?? '';
            $dob = $_POST['dob'] ?? '';
            $country = $_POST['country'] ?? 1;

            if (!$firstName || !$lastName || !$email || !$password || !$passwordConfirm || !$dob) {
                $this->render('signup', ['title' => 'Sign Up', 'error' => 'All fields are required.']);
                return;
            }

            if ($password !== $passwordConfirm) {
                $this->render('signup', ['title' => 'Sign Up', 'error' => 'Passwords do not match.']);
                return;
            }

            $userModel = new UserModel();
            if ($userModel->findByEmail($email)) {
                $this->render('signup', ['title' => 'Sign Up', 'error' => 'Email already used.']);
                return;
            }

            $user = $userModel->create([
                'firstName' => $firstName,
                'lastName' => $lastName,
                'email' => $email,
                'password' => $password,
                'dob' => $dob,
                'country' => $country,
            ]);

            Auth::login($user);
            header('Location: /NEWMVCtwigArchitecture/dashboard');
            exit;
        }

        $this->render('signup', ['title' => 'Sign Up']);
    }
}
