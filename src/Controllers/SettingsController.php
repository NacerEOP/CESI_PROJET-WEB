<?php

namespace App\Controllers;

class SettingsController extends BaseController
{
    public function index()
    {
        $this->render('settings', [
            'title' => 'Settings'
        ]);
    }
}