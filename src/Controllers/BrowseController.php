<?php

namespace App\Controllers;

use App\Models\DbInternshipModel;
use App\Models\CompanyModel;

class BrowseController extends BaseController
{
    private $internshipModel;
    private $companyModel;

    public function __construct()
    {
        parent::__construct();
        $this->internshipModel = new DbInternshipModel();
        $this->companyModel = new CompanyModel();
    }

    public function index()
    {
        $this->render('browse', [
            'title' => 'Browse Internships'
        ]);
    }

    public function getInternships()
    {
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        $perPage = 3;
        $offset = ($page - 1) * $perPage;

        $internships = $this->internshipModel->getAll($perPage, $offset);

        header("Content-Type: application/json");
        echo json_encode([
            "data" => $internships,
            "total" => count($internships)
        ]);
    }

    public function getCompanies()
    {
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        $perPage = 3;
        $offset = ($page - 1) * $perPage;

        $companies = $this->companyModel->getAll();

        // For now, simple pagination
        $paginated = array_slice($companies, $offset, $perPage);

        header("Content-Type: application/json");
        echo json_encode([
            "data" => $paginated,
            "total" => count($companies)
        ]);
    }

    public function uploadCV()
    {
        // adapted from original upload_cv.php
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['cv'])) {
            // use absolute path to uploads directory
            $uploadDir = __DIR__ . '/../../static/uploads/';
            
            // create directory if it doesn't exist
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            // check other form fields if needed (name, email)
            $file = $_FILES['cv'];

            $allowedTypes = ["pdf","doc","docx"];
            $maxSize = 5 * 1024 * 1024;

            $fileName = basename($file["name"]);
            $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

            if (!in_array($fileExt, $allowedTypes)) {
                echo "Invalid file type.";
                return;
            }
            if ($file["size"] > $maxSize) {
                echo "File too large.";
                return;
            }

            $newName = uniqid("cv_", true) . "." . $fileExt;
            $targetFile = $uploadDir . $newName;

            if (move_uploaded_file($file['tmp_name'], $targetFile)) {
                echo "Application submitted successfully.";
            } else {
                echo "Upload failed.";
            }
        }
    }
}
