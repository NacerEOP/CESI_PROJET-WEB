<?php

namespace App\Controllers;

class FormController extends BaseController
{
    public function index()
    {
        $this->render('form', [
            'title' => 'Form'
        ]);
    }
}