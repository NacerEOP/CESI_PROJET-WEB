<?php

$dataFile = "../data/internships.json";

$internships = json_decode(file_get_contents($dataFile), true);

$perPage = 3;

$page = isset($_GET['page']) ? intval($_GET['page']) : 1;

$total = count($internships);

$totalPages = ceil($total / $perPage);

$start = ($page - 1) * $perPage;

$current = array_slice($internships,$start,$perPage);

$response = [
    "data" => $current,
    "totalPages" => $totalPages
];

header("Content-Type: application/json");

echo json_encode($response);

?>