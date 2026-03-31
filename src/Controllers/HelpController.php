<?php

namespace App\Controllers;

class HelpController extends BaseController
{
    public function index()
    {
        $this->render('help', [
            'title' => 'Help'
        ]);
    }

    public function legal()
    {
        $this->render('legal', [
            'title' => 'Legal Notice'
        ]);
    }
}