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
        $internships = $this->model->getAll();

        $this->render('internship', [
            'title' => 'Internship Details',
            'internships' => $internships,
            'user' => Auth::user(),
        ]);
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
