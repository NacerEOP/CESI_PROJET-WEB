<?php

namespace App\Controllers;

use App\Models\StudentModel;
use App\Models\Auth;

class StudentController extends BaseController
{
    private $model;

    public function __construct()
    {
        parent::__construct();
        $this->model = new StudentModel();
    }

    public function index()
    {
        // Check permissions: admin or pilot
        if (!Auth::hasRole(['admin', 'pilot'])) {
            http_response_code(403);
            echo 'Forbidden - Insufficient permissions';
            return;
        }

        $filters = [
            'query' => trim($_GET['q'] ?? ''),
        ];

        // If user is pilot, only show their students
        if (Auth::hasRole('pilot')) {
            $filters['pilotId'] = Auth::user()['id'];
        }

        // If no filters, show all (or pilot's students)
        if ($filters['query'] === '' && !isset($filters['pilotId'])) {
            $students = $this->model->getAll();
        } else {
            $students = $this->model->search($filters, 1000, 0);
        }

        $pilots = Auth::hasRole('admin') ? $this->model->getPilots() : [];

        $this->render('students', [
            'title' => 'Student Management',
            'students' => $students,
            'filters' => $filters,
            'pilots' => $pilots,
            'user' => Auth::user(),
        ]);
    }

    public function create()
    {
        // Check permissions
        if (!Auth::hasRole(['admin', 'pilot'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }

        $data = $_POST;

        if (empty($data['firstName']) || empty($data['lastName']) || empty($data['email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'First name, last name, and email are required']);
            return;
        }

        // If pilot, set pilotId to themselves
        if (Auth::hasRole('pilot')) {
            $data['pilotId'] = Auth::user()['id'];
        } elseif (Auth::hasRole('admin') && empty($data['pilotId'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Pilot ID is required for admins']);
            return;
        }

        try {
            $student = $this->model->create($data);
            echo json_encode(['success' => true, 'student' => $student]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create student: ' . $e->getMessage()]);
        }
    }

    public function update($id)
    {
        $id = $id ?? ($_POST['id'] ?? null);
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Student ID is required']);
            return;
        }

        // Check permissions
        if (!Auth::hasRole(['admin', 'pilot'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }

        $data = $_POST;

        // Check if student exists
        $student = $this->model->findById($id);
        if (!$student) {
            http_response_code(404);
            echo json_encode(['error' => 'Student not found']);
            return;
        }

        // If pilot, check if student belongs to them
        if (Auth::hasRole('pilot')) {
            if ($student['PilotId'] != Auth::user()['id']) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden - Can only modify own students']);
                return;
            }
        }

        try {
            $student = $this->model->update($id, $data);
            echo json_encode(['success' => true, 'student' => $student]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update student: ' . $e->getMessage()]);
        }
    }

    public function delete($id)
    {
        $id = $id ?? ($_POST['id'] ?? null);
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Student ID is required']);
            return;
        }

        // Check permissions
        if (!Auth::hasRole(['admin', 'pilot'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }

        // If pilot, check if student belongs to them
        if (Auth::hasRole('pilot')) {
            $student = $this->model->findById($id);
            if (!$student) {
                http_response_code(404);
                echo json_encode(['error' => 'Student not found']);
                return;
            }
            if ($student['PilotId'] != Auth::user()['id']) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden - Can only delete own students']);
                return;
            }
        } else {
            // For admin, still check if student exists
            $student = $this->model->findById($id);
            if (!$student) {
                http_response_code(404);
                echo json_encode(['error' => 'Student not found']);
                return;
            }
        }

        try {
            $this->model->delete($id);
            http_response_code(204);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete student: ' . $e->getMessage() . ' (Code: ' . $e->getCode() . ')']);
        }
    }

    public function search()
    {
        // Check permissions
        if (!Auth::hasRole(['admin', 'pilot'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        $filters = [
            'query' => trim($_GET['q'] ?? ''),
        ];

        // If pilot, only search their students
        if (Auth::hasRole('pilot')) {
            $filters['pilotId'] = Auth::user()['id'];
        }

        $limit = (int)($_GET['limit'] ?? 100);
        $offset = (int)($_GET['offset'] ?? 0);

        $students = $this->model->search($filters, $limit, $offset);

        echo json_encode(['students' => $students]);
    }

    public function getDetailed($id)
    {
        // Check permissions
        if (!Auth::hasRole(['admin', 'pilot'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            return;
        }

        try {
            $student = $this->model->findById($id);
            if (!$student) {
                http_response_code(404);
                echo json_encode(['error' => 'Student not found']);
                return;
            }

            // If pilot, check if student belongs to them
            if (Auth::hasRole('pilot') && $student['PilotId'] != Auth::user()['id']) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden - Can only view own students']);
                return;
            }

            header('Content-Type: application/json');
            echo json_encode($student);
        } catch (\Exception $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
        }
    }
}