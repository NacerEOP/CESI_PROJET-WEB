<?php

require_once __DIR__ . '/vendor/autoload.php';
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

use App\Config\AppConfig;

// Serve static files directly
$basePath = AppConfig::getBasePath();
$request = $_SERVER['REQUEST_URI'];

// Check if it's a static file request
if (strpos($request, '/static/') !== false || strpos($request, '.css') !== false || strpos($request, '.js') !== false || strpos($request, '.jpg') !== false || strpos($request, '.png') !== false) {
    // Remove base path from request to get the relative file path
    $relativePath = str_replace($basePath, '', $request);
    // Convert URL path to filesystem path (replace forward slashes with directory separator)
    $filePath = __DIR__ . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, trim($relativePath, '/'));
    if (file_exists($filePath)) {
        // Set proper content type
        $ext = pathinfo($filePath, PATHINFO_EXTENSION);
        $mimeTypes = [
            'css' => 'text/css',
            'js' => 'application/javascript',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'mp4' => 'video/mp4',
            'pdf' => 'application/pdf'
        ];
        header('Content-Type: ' . ($mimeTypes[$ext] ?? 'text/plain'));
        readfile($filePath);
        exit;
    }
}

use App\Controllers\HomeController;
use App\Controllers\BrowseController;
use App\Controllers\DashboardController;
use App\Controllers\HelpController;
use App\Controllers\LoginController;
use App\Controllers\SignupController;
use App\Controllers\ProfileController;
use App\Controllers\SettingsController;
use App\Controllers\ApplicationController;
use App\Controllers\InternshipController;
use App\Controllers\FormController;
use App\Controllers\CompanyController;
use App\Models\Auth;

// Start session for authentication
session_start();

// Function to check if user is logged in, redirect to login if not
function requireAuth($basePath = '/') {
    if (!Auth::isLoggedIn()) {
        header('Location: ' . $basePath . '/login');
        exit;
    }
}

// Simple router
$request = $_SERVER['REQUEST_URI'];
$request = str_replace($basePath, '', $request);

// Remove query string for routing
$requestPath = parse_url($request, PHP_URL_PATH);

switch ($requestPath) {
    case '/':
    case '/home':
        if (!Auth::isLoggedIn()) {
            header('Location: ' . $basePath . '/login');
            exit;
        }
        $controller = new HomeController();
        $controller->index();
        break;
    case '/browse':
        $controller = new BrowseController();
        $controller->index();
        break;
    case '/dashboard':
        requireAuth($basePath);
        $controller = new DashboardController();
        $controller->index();
        break;
    case '/help':
        $controller = new HelpController();
        $controller->index();
        break;
    case '/login':
        $controller = new LoginController();
        $controller->index();
        break;
    case '/signup':
        $controller = new SignupController();
        $controller->index();
        break;
    case '/profile':
        requireAuth($basePath);
        $controller = new ProfileController();
        $controller->index();
        break;
    case '/settings':
        requireAuth($basePath);
        $controller = new SettingsController();
        $controller->index();
        break;
    case '/application':
        requireAuth($basePath);
        $controller = new ApplicationController();
        $controller->index();
        break;
    case '/internship':
        requireAuth($basePath);
        $controller = new InternshipController();
        $controller->index();
        break;
    case '/form':
        requireAuth($basePath);
        $controller = new FormController();
        $controller->index();
        break;
    case '/companies':
        $controller = new CompanyController();
        $controller->index();
        break;
    case '/logout':
        $controller = new LoginController();
        $controller->logout();
        break;
    case '/api/internships':
        $controller = new BrowseController();
        $controller->getInternships();
        break;
    case '/api/companies/create':
        requireAuth($basePath);
        $controller = new CompanyController();
        $controller->create();
        break;
    case '/api/companies/delete':
        requireAuth($basePath);
        if (isset($_POST['id'])) {
            $controller = new CompanyController();
            $controller->delete($_POST['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
        }
        break;
    case '/api/companies/rate':
        requireAuth($basePath);
        $controller = new CompanyController();
        $controller->rate();
        break;
    case '/api/companies/ratings':
        $controller = new CompanyController();
        $controller->getRatings();
        break;
    case '/upload-cv':
        $controller = new BrowseController();
        $controller->uploadCV();
        break;
    default:
        http_response_code(404);
        echo '404 Not Found';
        break;
}
