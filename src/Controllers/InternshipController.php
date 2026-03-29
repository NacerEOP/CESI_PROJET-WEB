<?php

namespace App\Controllers;

use App\Models\DbInternshipModel;
use App\Models\Auth;

class InternshipController extends BaseController
{
    private $model;

    public function __construct()
    {
        parent::__construct();
        $this->model = new DbInternshipModel();
    }

    public function index()
    {
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $perPage = 20;
        $offset = ($page - 1) * $perPage;

        $internships = $this->model->getAll($perPage, $offset);
        $totalInternships = $this->model->count();

        $this->render('internship', [
            'title' => 'Internship Details',
            'internships' => $internships,
            'user' => Auth::user(),
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $totalInternships,
        ]);
    }

    public function getDetailed($id)
    {
        try {
            $internship = $this->model->getDetailedById($id);
            if (!$internship) {
                http_response_code(404);
                echo json_encode(['error' => 'Internship not found']);
                return;
            }
            header('Content-Type: application/json');
            echo json_encode($internship);
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
                'skills' => isset($_GET['skills']) ? explode(',', $_GET['skills']) : [],
                'category' => $_GET['category'] ?? '',
                'company' => $_GET['company'] ?? '',
                'budget_min' => $_GET['budget_min'] ?? '',
                'budget_max' => $_GET['budget_max'] ?? '',
            ];
            $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
            $perPage = 20;
            $offset = ($page - 1) * $perPage;

            $internships = $this->model->search($filters, $perPage, $offset);
            $totalInternships = $this->model->count($filters);

            header('Content-Type: application/json');
            echo json_encode([
                'data' => $internships,
                'page' => $page,
                'per_page' => $perPage,
                'total' => $totalInternships,
            ]);
        } catch (\Exception $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
        }
    }

    public function getStats()
    {
        $stats = $this->model->getStats();
        header('Content-Type: application/json');
        echo json_encode($stats);
    }

    public function create()
    {
        if (!Auth::hasRole(['admin', 'pilot'])) {
            http_response_code(403);
            echo 'Forbidden';
            return;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = [
                'title' => trim($_POST['title'] ?? ''),
                'description' => trim($_POST['description'] ?? ''),
                'date' => $_POST['date'] ?? date('Y-m-d'),
                'budget' => floatval($_POST['budget'] ?? 0),
                'time' => intval($_POST['time'] ?? 0),
                'category' => intval($_POST['category'] ?? 1),
                'company' => intval($_POST['company'] ?? 1),
                'skills' => isset($_POST['skills']) ? (is_array($_POST['skills']) ? $_POST['skills'] : [$_POST['skills']]) : [],
            ];
            $internship = $this->model->create($data);
            header('Content-Type: application/json');
            echo json_encode($internship);
            return;
        }

        http_response_code(405);
        echo 'Method not allowed';
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
            'title' => trim($_POST['title'] ?? ''),
            'description' => trim($_POST['description'] ?? ''),
            'date' => $_POST['date'] ?? date('Y-m-d'),
            'budget' => floatval($_POST['budget'] ?? 0),
            'time' => intval($_POST['time'] ?? 0),
            'category' => intval($_POST['category'] ?? 1),
            'company' => intval($_POST['company'] ?? 1),
            'skills' => isset($_POST['skills']) ? (is_array($_POST['skills']) ? $_POST['skills'] : [$_POST['skills']]) : [],
        ];

        $updated = $this->model->update($id, $data);
        header('Content-Type: application/json');
        echo json_encode($updated);
    }

    public function delete($id)
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

        $this->model->delete($id);
        http_response_code(204);
    }
}
