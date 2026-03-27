<?php

namespace App\Controllers;

use App\Models\CompanyModel;
use App\Models\Auth;

class CompanyController extends BaseController
{
    private $model;

    public function __construct()
    {
        parent::__construct();
        $this->model = new CompanyModel();
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

    public function create()
    {
        if (!Auth::hasRole(['admin', 'pilot'])) {
            http_response_code(403);
            echo 'Forbidden';
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
            $company = $this->model->create($data);
            header('Content-Type: application/json');
            echo json_encode($company);
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
