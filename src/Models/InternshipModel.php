<?php

namespace App\Models;

class InternshipModel
{
    private $dataFile;

    public function __construct()
    {
        $this->dataFile = __DIR__ . '/../../data/internships.json';
    }

    public function getAllInternships()
    {
        $data = file_get_contents($this->dataFile);
        return json_decode($data, true);
    }

    public function getInternshipsPaginated($page, $perPage)
    {
        $internships = $this->getAllInternships();
        $total = count($internships);
        $start = ($page - 1) * $perPage;
        return array_slice($internships, $start, $perPage);
    }

    public function getTotalPages($perPage)
    {
        $internships = $this->getAllInternships();
        $total = count($internships);
        return ceil($total / $perPage);
    }
}