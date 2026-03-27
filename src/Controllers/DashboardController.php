<?php

namespace App\Controllers;

use App\Models\Auth;
use App\Models\UserModel;
use App\Models\ApplicationModel;
use App\Models\CompanyModel;

class DashboardController extends BaseController
{
    public function index()
    {
        $user = Auth::user();
        $role = $user['role'];

        $data = [
            'title' => 'Dashboard',
            'user' => $user,
            'role' => $role,
        ];

        if ($role === 'student') {
            // Get applied internships
            $applicationModel = new ApplicationModel();
            $applications = $applicationModel->getByUser($user['id']);
            $data['applications'] = $applications;
        } elseif ($role === 'pilot') {
            // Get students under this pilot
            $userModel = new UserModel();
            $students = $userModel->getStudentsByPilot($user['id']);
            $data['students'] = $students;

            // Company reviews - assuming companies have descriptions as reviews
            $companyModel = new CompanyModel();
            $companies = $companyModel->getAll();
            $data['companies'] = $companies;
        } elseif ($role === 'admin') {
            // Website traffic - placeholder, perhaps count users or something
            $userModel = new UserModel();
            $totalUsers = $userModel->getTotalUsers();
            $data['totalUsers'] = $totalUsers;

            // Company reviews
            $companyModel = new CompanyModel();
            $companies = $companyModel->getAll();
            $data['companies'] = $companies;
        }

        $this->render('dashboard', $data);
    }
}
