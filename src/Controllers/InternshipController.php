<?php

namespace App\Controllers;

class InternshipController extends BaseController
{
    public function index()
    {
        $this->render('internship', [
            'title' => 'Internship Details'
        ]);
    }
}