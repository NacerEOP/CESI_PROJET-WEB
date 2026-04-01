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
use App\Controllers\PilotController;
use App\Controllers\StudentController;
use App\Controllers\WishListController;
use App\Models\Auth;
use App\Models\ApplicationModel;

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
    case '/legal':
        $controller = new HelpController();
        $controller->legal();
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
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->apply();
        } else {
            $controller->myApplications();
        }
        break;
    case '/application/pilot':
        requireAuth($basePath);
        $controller = new ApplicationController();
        $controller->pilotApplications();
        break;
    case '/internship':
        requireAuth($basePath);
        $controller = new InternshipController();
        $controller->index();
        break;
    case '/internship/detail':
        requireAuth($basePath);
        $controller = new InternshipController();
        $controller->detailPage();
        break;
    case '/form':
        requireAuth($basePath);
        $controller = new FormController();
        $controller->index();
        break;
    case '/companies':
        requireAuth($basePath);
        $controller = new CompanyController();
        $controller->index();
        break;
    case '/pilots':
        requireAuth($basePath);
        $controller = new PilotController();
        $controller->index();
        break;
    case '/students':
        requireAuth($basePath);
        $controller = new StudentController();
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
    case '/api/internships/search':
        $controller = new InternshipController();
        $controller->search();
        break;
    case '/api/internships/stats':
        $controller = new InternshipController();
        $controller->getStats();
        break;
    case '/api/internships/create':
        requireAuth($basePath);
        $controller = new InternshipController();
        $controller->create();
        break;
    case '/api/internships/update':
        requireAuth($basePath);
        if (isset($_GET['id'])) {
            $controller = new InternshipController();
            $controller->update($_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
        }
        break;
    case '/api/internships/delete':
        requireAuth($basePath);
        if (isset($_POST['id'])) {
            $controller = new InternshipController();
            $controller->delete($_POST['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
        }
        break;
    case '/api/companies/detail':
        if (isset($_GET['id'])) {
            $controller = new CompanyController();
            $controller->getDetailed($_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
        }
        break;
        requireAuth($basePath);
        if (isset($_POST['id'])) {
            $controller = new InternshipController();
            $controller->delete($_POST['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
        }
        break;
    case '/api/internships/detail':
        if (isset($_GET['id'])) {
            $controller = new InternshipController();
            $controller->getDetailed($_GET['id']);
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
    case '/api/applications/check':
        requireAuth($basePath);
        if ($_SESSION['user']['role'] !== 'student') {
            http_response_code(403);
            return;
        }
        $internshipId = $_GET['internshipId'] ?? null;
        if (!$internshipId) {
            http_response_code(400);
            return;
        }
        $model = new ApplicationModel();
        $stmt = $model->db->prepare('SELECT COUNT(*) FROM Application WHERE IdInternship = :internshipId AND IdUser = :userId');
        $stmt->execute(['internshipId' => $internshipId, 'userId' => $_SESSION['user']['id']]);
        echo json_encode($stmt->fetchColumn() > 0);
        break;
    case '/api/companies/search':
        $controller = new CompanyController();
        $controller->search();
        break;
    case '/api/companies/detail':
        if (isset($_GET['id'])) {
            $controller = new CompanyController();
            $controller->getDetailed($_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
        }
        break;
    case '/api/companies/create':
        requireAuth($basePath);
        $controller = new CompanyController();
        $controller->create();
        break;
    case '/api/companies/update':
        requireAuth($basePath);
        if (isset($_GET['id'])) {
            $controller = new CompanyController();
            $controller->update($_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
        }
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
    case '/api/companies':
        $controller = new BrowseController();
        $controller->getCompanies();
        break;
    case '/api/pilots/search':
        requireAuth($basePath);
        $controller = new PilotController();
        $controller->search();
        break;
    case '/api/pilots/detail':
        requireAuth($basePath);
        if (isset($_GET['id'])) {
            $controller = new PilotController();
            $controller->getDetailed($_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
        }
        break;
    case '/api/pilots/create':
        requireAuth($basePath);
        $controller = new PilotController();
        $controller->create();
        break;
    case '/api/pilots/update':
        requireAuth($basePath);
        $pilotId = $_GET['id'] ?? $_POST['id'] ?? null;
        if ($pilotId) {
            $controller = new PilotController();
            $controller->update($pilotId);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
        }
        break;
    case '/api/pilots/delete':
        requireAuth($basePath);
        $pilotId = $_POST['id'] ?? $_GET['id'] ?? null;
        if ($pilotId) {
            $controller = new PilotController();
            $controller->delete($pilotId);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
        }
        break;
    case '/api/students/search':
        requireAuth($basePath);
        $controller = new StudentController();
        $controller->search();
        break;
    case '/api/students/detail':
        requireAuth($basePath);
        if (isset($_GET['id'])) {
            $controller = new StudentController();
            $controller->getDetailed($_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
        }
        break;
    case '/api/students/create':
        requireAuth($basePath);
        $controller = new StudentController();
        $controller->create();
        break;
    case '/api/students/update':
        requireAuth($basePath);
        $studentId = $_GET['id'] ?? $_POST['id'] ?? null;
        if ($studentId) {
            $controller = new StudentController();
            $controller->update($studentId);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
        }
        break;
    case '/api/students/delete':
        requireAuth($basePath);
        $studentId = $_POST['id'] ?? $_GET['id'] ?? null;
        if ($studentId) {
            $controller = new StudentController();
            $controller->delete($studentId);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Bad request']);
        }
        break;
    case '/wishlist':
        requireAuth($basePath);
        $controller = new WishListController();
        $controller->index();
        break;
    case '/api/wishlist/add':
        requireAuth($basePath);
        $controller = new WishListController();
        $controller->add();
        break;
    case '/api/wishlist/remove':
        requireAuth($basePath);
        $controller = new WishListController();
        $controller->remove();
        break;
    case '/api/wishlist/check':
        requireAuth($basePath);
        $controller = new WishListController();
        $controller->check();
        break;
    case '/api/offers/random':
        $controller = new HomeController();
        $controller->getRandomOffers();
        break;
    default:
        http_response_code(404);
        echo '404 Not Found';
        break;
}
