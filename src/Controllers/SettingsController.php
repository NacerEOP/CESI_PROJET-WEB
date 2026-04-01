<?php

namespace App\Controllers;

use App\Models\Auth;

class SettingsController extends BaseController
{
    public function index()
    {
        $user = Auth::user();

        $this->render('settings', [
            'title' => 'Settings',
            'user' => $user,
        ]);
    }
}