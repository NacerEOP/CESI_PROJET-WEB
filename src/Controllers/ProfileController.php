<?php

namespace App\Controllers;

use App\Models\Auth;

class ProfileController extends BaseController
{
    public function index()
    {
        $user = Auth::user();

        $this->render('profile', [
            'title' => 'Profile',
            'user' => $user,
        ]);
    }
}