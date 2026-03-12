<?php

namespace App\Controllers;

use Twig\Environment;
use Twig\Loader\FilesystemLoader;

abstract class BaseController
{
    protected $twig;

    public function __construct()
    {
        // basic loader pointing at root templates directory
        // controllers are in src/Controllers, so we need to go up two levels
        $loader = new FilesystemLoader(__DIR__ . '/../../templates');
        $this->twig = new Environment($loader);
    }

    protected function render($template, $data = [])
    {
        // ensure baseUrl is available in every view
        $data['baseUrl'] = '/NEWMVCtwigArchitecture';

        // append default extension if not provided
        if (!str_ends_with($template, '.twig.html')) {
            $template .= '.twig.html';
        }
        echo $this->twig->render($template, $data);
    }
}