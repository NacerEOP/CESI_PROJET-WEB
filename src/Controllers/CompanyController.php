<?php

namespace App\Controllers;

use App\Models\CompanyModel;
use App\Models\CompanyRatingModel;
use App\Models\Auth;

class CompanyController extends BaseController
{
    private $model;
    private $ratingModel;

    public function __construct()
    {
        parent::__construct();
        $this->model = new CompanyModel();
        $this->ratingModel = new CompanyRatingModel();
    }

    public function index()
    {
        $companies = $this->model->getAll();
        $this->render('companies', [
            'title' => 'Companies',
            'companies' => $companies,
            'user' => Auth::user(),
        ]);
    }

    public function getDetailed($id)
    {
        try {
            $company = $this->model->getDetailedById($id);
            if (!$company) {
                http_response_code(404);
                echo json_encode(['error' => 'Company not found']);
                return;
            }
            header('Content-Type: application/json');
            echo json_encode($company);
        } catch (\Exception $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
        }
    }

    public function search()
    {
        try {
            $filters = [
                'query' => $_GET['q'] ?? '',
                'country' => $_GET['country'] ?? '',
            ];
            $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
            $perPage = 20;
            $offset = ($page - 1) * $perPage;

            $companies = $this->model->search($filters, $perPage, $offset);

            foreach ($companies as &$company) {
                $company['average_rating'] = $this->ratingModel->getAverageRating($company['IdCompany']);
            }

            header('Content-Type: application/json');
            echo json_encode([
                'data' => $companies,
                'page' => $page,
                'per_page' => $perPage,
                'total' => count($companies), // approximate
            ]);
        } catch (\Exception $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
        }
    }

    public function create()
    {
        if (!Auth::hasRole(['admin', 'pilot'])) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = [
                'name' => trim($_POST['name'] ?? ''),
                'description' => trim($_POST['description'] ?? ''),
                'email' => trim($_POST['email'] ?? ''),
                'phone' => trim($_POST['phone'] ?? ''),
                'country' => intval($_POST['country'] ?? 1),
            ];
            
            if (empty($data['name']) || empty($data['email'])) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode(['error' => 'Name and email are required']);
                return;
            }
            
            $company = $this->model->create($data);
            header('Content-Type: application/json');
            echo json_encode($company);
            return;
        }

        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Method not allowed']);
    }

    public function update($id)
    {
        if (!Auth::hasRole(['admin', 'pilot'])) {
            http_response_code(403);
            echo 'Forbidden';
            return;
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo 'Method not allowed';
            return;
        }

        $data = [
            'name' => trim($_POST['name'] ?? ''),
            'description' => trim($_POST['description'] ?? ''),
            'email' => trim($_POST['email'] ?? ''),
            'phone' => trim($_POST['phone'] ?? ''),
            'country' => intval($_POST['country'] ?? 1),
        ];
        $company = $this->model->update($id, $data);
        header('Content-Type: application/json');
        echo json_encode($company);
    }

    public function delete($id)
    {
        if (!Auth::hasRole(['admin', 'pilot'])) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }

        try {
            $success = $this->model->delete($id);
            if ($success) {
                http_response_code(204);
            } else {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode(['error' => 'Failed to delete company']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * SFx5 - Save a rating for a company
     */
    public function rate()
    {
        // Check authorization - only admin and pilot can rate
        if (!Auth::hasRole(['admin', 'pilot'])) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Forbidden - Only Admin and Pilot can rate companies']);
            return;
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }

        // Get user info
        $user = Auth::user();
        if (!$user) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        // Validate input
        $companyId = intval($_POST['companyId'] ?? 0);
        $rating = intval($_POST['rating'] ?? 0);
        $ratingText = trim($_POST['ratingText'] ?? '');

        if ($companyId <= 0) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Invalid company ID']);
            return;
        }

        if ($rating < 1 || $rating > 5) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Rating must be between 1 and 5']);
            return;
        }

        // Check if company exists
        $company = $this->model->getById($companyId);
        if (!$company) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Company not found']);
            return;
        }

        try {
            $result = $this->ratingModel->saveRating(
                $companyId,
                $user['id'],
                $rating,
                $ratingText,
                $user['role']
            );

            if ($result) {
                http_response_code(200);
                header('Content-Type: application/json');
                echo json_encode([
                    'message' => 'Rating saved successfully',
                    'rating' => $result
                ]);
            } else {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode(['error' => 'Failed to save rating']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    /**
     * Get ratings for a company
     */
    public function getRatings($companyId = null)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }

        // Get company ID from URL parameter if not provided
        if ($companyId === null) {
            $companyId = intval($_GET['companyId'] ?? 0);
        }

        if ($companyId <= 0) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Invalid company ID']);
            return;
        }

        // Check if company exists
        $company = $this->model->getById($companyId);
        if (!$company) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Company not found']);
            return;
        }

        try {
            $ratings = $this->ratingModel->getCompanyRatings($companyId);
            $averageRating = $this->ratingModel->getAverageRating($companyId);
            $ratingCount = $this->ratingModel->getRatingCount($companyId);

            $user = Auth::user();
            $userRating = null;
            if ($user && Auth::hasRole(['admin', 'pilot'])) {
                $userRating = $this->ratingModel->getRating($companyId, $user['id'], $user['role']);
            }

            http_response_code(200);
            header('Content-Type: application/json');
            echo json_encode([
                'ratings' => $ratings,
                'averageRating' => $averageRating,
                'ratingCount' => $ratingCount,
                'userRating' => $userRating
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
