<?php

namespace App\Controllers;

use Twig\Environment;
use Twig\Loader\FilesystemLoader;

abstract class BaseController
{
    protected $twig;

    public function __construct()
    {
        // basic loader points to src/Views first, fallback to templates for compatibility
        $paths = [
            __DIR__ . '/../Views',
            __DIR__ . '/../../templates'
        ];
        $loader = new FilesystemLoader($paths);
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
