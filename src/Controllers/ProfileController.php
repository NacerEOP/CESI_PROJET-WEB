<?php

namespace App\Controllers;

class ProfileController extends BaseController
{
    public function index()
    {
        $this->render('profile', [
            'title' => 'Profile'
        ]);
    }
}