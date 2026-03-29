<?php

namespace App\Controllers;

use App\Models\ApplicationModel;

class ApplicationController extends BaseController
{
    public function index()
    {
        $this->render('application', [
            'title' => 'Application'
        ]);
    }

    private function ensureSession()
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }
    }

    public function apply()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            return;
        }
        $this->ensureSession();
        if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
            http_response_code(403);
            return;
        }
        $internshipId = $_POST['internshipId'] ?? null;
        $lm = $_POST['lm'] ?? '';
        $cv = $_FILES['cv'] ?? null;
        if (!$internshipId || !$cv || $cv['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            return;
        }
        // Validate CV is PDF
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $cv['tmp_name']);
        finfo_close($finfo);
        if ($mime !== 'application/pdf') {
            http_response_code(400);
            return;
        }
        // Move files
        $userId = $_SESSION['user']['id'];
        $cvPath = __DIR__ . '/../../static/uploads/cv_' . $internshipId . '_' . $userId . '.pdf';
        $lmPath = __DIR__ . '/../../static/uploads/lm_' . $internshipId . '_' . $userId . '.txt';
        if (!move_uploaded_file($cv['tmp_name'], $cvPath)) {
            http_response_code(500);
            return;
        }
        file_put_contents($lmPath, $lm);
        // Insert into DB
        $model = new ApplicationModel();
        if ($model->apply($internshipId, $userId)) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(409); // Already applied
        }
    }

    public function myApplications()
    {
        $this->ensureSession();
        if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'student') {
            http_response_code(403);
            return;
        }
        $model = new ApplicationModel();
        $applications = $model->getByUser($_SESSION['user']['id']);
        $this->render('application', [
            'title' => 'My Applications',
            'applications' => $applications
        ]);
    }

    public function pilotApplications()
    {
        $this->ensureSession();
        if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'pilot') {
            http_response_code(403);
            return;
        }
        $model = new ApplicationModel();
        $applications = $model->getByPilot($_SESSION['user']['id']);
        $this->render('application', [
            'title' => 'Student Applications',
            'applications' => $applications
        ]);
    }
}