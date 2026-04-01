<?php

namespace App\Controllers;

use App\Models\PilotModel;
use App\Models\CompanyModel;
use App\Models\Auth;

class PilotController extends BaseController
{
    private $model;
    private $companyModel;

    public function __construct()
    {
        parent::__construct();
        $this->model = new PilotModel();
        $this->companyModel = new CompanyModel();
    }

    public function index()
    {
        // Check if user is admin
        if (!Auth::hasRole('admin')) {
            http_response_code(403);
            echo 'Forbidden - Only administrators can manage pilots';
            return;
        }

        $filters = [
            'query' => trim($_GET['q'] ?? ''),
        ];

        // If no filters, show all pilots
        if ($filters['query'] === '') {
            $pilots = $this->model->getAll();
        } else {
            $pilots = $this->model->search($filters, 1000, 0);
        }

        $this->render('pilots', [
            'title' => 'Pilot Management',
            'pilots' => $pilots,
            'filters' => $filters,
            'user' => Auth::user(),
        ]);
    }

    public function search()
    {
        try {
            $filters = [
                'query' => $_GET['q'] ?? '',
            ];
            $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
            $perPage = 20;
            $offset = ($page - 1) * $perPage;

            $pilots = $this->model->search($filters, $perPage, $offset);

            $totalPilots = $this->model->count($filters);
            foreach ($pilots as &$pilot) {
                $pilot['students_count'] = $this->model->getStudentsCount($pilot['IdUser']);
            }

            header('Content-Type: application/json');
            echo json_encode([
                'data' => $pilots,
                'page' => $page,
                'per_page' => $perPage,
                'total' => $totalPilots,
            ]);
        } catch (\Exception $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
        }
    }

    public function create()
    {
        if (!Auth::hasRole('admin')) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = [
                'firstName' => trim($_POST['firstName'] ?? ''),
                'lastName' => trim($_POST['lastName'] ?? ''),
                'email' => trim($_POST['email'] ?? ''),
                'password' => trim($_POST['password'] ?? ''),
                'phone' => trim($_POST['phone'] ?? ''),
                'dob' => trim($_POST['dob'] ?? ''),
                'country' => intval($_POST['country'] ?? 1),
            ];

            if (empty($data['firstName']) || empty($data['lastName']) || empty($data['email']) || empty($data['password']) || empty($data['dob'])) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode(['error' => 'First name, last name, email, password, and date of birth are required']);
                return;
            }

            $pilot = $this->model->create($data);
            if ($pilot) {
                header('Content-Type: application/json');
                echo json_encode($pilot);
            } else {
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode(['error' => 'Failed to create pilot']);
            }
            return;
        }

        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Method not allowed']);
    }

    public function update($id)
    {
        $id = $id ?? ($_POST['id'] ?? null);
        if (empty($id)) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Pilot ID is required']);
            return;
        }

        if (!Auth::hasRole('admin')) {
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

        $data = [
            'firstName' => trim($_POST['firstName'] ?? ''),
            'lastName' => trim($_POST['lastName'] ?? ''),
            'email' => trim($_POST['email'] ?? ''),
            'phone' => trim($_POST['phone'] ?? ''),
            'dob' => trim($_POST['dob'] ?? ''),
            'country' => intval($_POST['country'] ?? 1),
        ];

        if (empty($data['firstName']) || empty($data['lastName']) || empty($data['email'])) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'First name, last name, and email are required']);
            return;
        }

        $pilot = $this->model->update($id, $data);
        if ($pilot) {
            header('Content-Type: application/json');
            echo json_encode($pilot);
        } else {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Failed to update pilot']);
        }
    }

    public function delete($id)
    {
        $id = $id ?? ($_POST['id'] ?? null);
        if (empty($id)) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Pilot ID is required']);
            return;
        }

        if (!Auth::hasRole('admin')) {
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
                echo json_encode(['error' => 'Failed to delete pilot']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function getDetailed($id)
    {
        try {
            $pilot = $this->model->getById($id);
            if (!$pilot) {
                http_response_code(404);
                echo json_encode(['error' => 'Pilot not found']);
                return;
            }

            // Add students count
            $pilot['students_count'] = $this->model->getStudentsCount($id);

            header('Content-Type: application/json');
            echo json_encode($pilot);
        } catch (\Exception $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
        }
    }
}