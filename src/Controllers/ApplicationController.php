<?php

namespace App\Controllers;

class ApplicationController extends BaseController
{
    public function index()
    {
        $this->render('application', [
            'title' => 'Application'
        ]);
    }
}