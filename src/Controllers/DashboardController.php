<?php

namespace App\Controllers;

use App\Models\Auth;

class DashboardController extends BaseController
{
    public function index()
    {
        if (!Auth::isLoggedIn()) {
            header('Location: /NEWMVCtwigArchitecture/login');
            exit;
        }

        $this->render('dashboard', [
            'title' => 'Dashboard',
            'user' => Auth::user(),
        ]);
    }
}
