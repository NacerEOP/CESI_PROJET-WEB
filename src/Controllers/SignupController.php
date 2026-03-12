<?php

namespace App\Controllers;

class SignupController extends BaseController
{
    public function index()
    {
        $this->render('signup', [
            'title' => 'Sign Up'
        ]);
    }
}