<?php

namespace App\Controllers;

class LoginController extends BaseController
{
    public function index()
    {
        $this->render('login', [
            'title' => 'Login'
        ]);
    }
}