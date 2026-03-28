<?php
// Serve static files directly
$basePath = '/NEWMVCtwigArchitecture';
$request = $_SERVER['REQUEST_URI'];

// Check if it's a static file request
if (strpos($request, '/static/') !== false || strpos($request, '.css') !== false || strpos($request, '.js') !== false || strpos($request, '.jpg') !== false || strpos($request, '.png') !== false) {
    $filePath = __DIR__ . str_replace($basePath, '', $request);
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

require_once __DIR__ . '/vendor/autoload.php';

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
function requireAuth() {
    if (!Auth::isLoggedIn()) {
        header('Location: /NEWMVCtwigArchitecture/login');
        exit;
    }
}

// Simple router
$request = $_SERVER['REQUEST_URI'];
$basePath = '/NEWMVCtwigArchitecture';
$request = str_replace($basePath, '', $request);

// Remove query string for routing
$requestPath = parse_url($request, PHP_URL_PATH);

switch ($requestPath) {
    case '/':
    case '/home':
        if (!Auth::isLoggedIn()) {
            header('Location: /NEWMVCtwigArchitecture/login');
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
        requireAuth();
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
        requireAuth();
        $controller = new ProfileController();
        $controller->index();
        break;
    case '/settings':
        requireAuth();
        $controller = new SettingsController();
        $controller->index();
        break;
    case '/application':
        requireAuth();
        $controller = new ApplicationController();
        $controller->index();
        break;
    case '/internship':
        requireAuth();
        $controller = new InternshipController();
        $controller->index();
        break;
    case '/form':
        requireAuth();
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
        requireAuth();
        $controller = new CompanyController();
        $controller->create();
        break;
    case '/api/companies/delete':
        requireAuth();
        if (isset($_POST['id'])) {
            $controller = new CompanyController();
            $controller->delete($_POST['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
        }
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
