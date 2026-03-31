<?php

namespace App\Controllers;

use App\Models\DbInternshipModel;

class HomeController extends BaseController
{
    public function index()
    {
        $model = new DbInternshipModel();
        $internshipCount = $model->count();
        
        $this->render('home', [
            'title' => 'Find Your Internship Today!',
            'internshipCount' => $internshipCount
        ]);
    }

    public function getRandomOffers()
    {
        try {
            $model = new DbInternshipModel();
            
            // Get total count
            $totalCount = $model->count();
            
            // Fetch 12 random offers
            $limit = 12;
            $randomOffset = mt_rand(0, max(0, $totalCount - $limit));
            $offers = $model->getAll($limit, $randomOffset);
            
            // Shuffle the results to ensure randomness
            shuffle($offers);
            
            // If not enough, get more
            if (count($offers) < $limit && $totalCount > count($offers)) {
                $moreOffers = $model->getAll($limit - count($offers), 0);
                $offers = array_merge($offers, $moreOffers);
                shuffle($offers);
            }
            
            header('Content-Type: application/json');
            echo json_encode($offers);
        } catch (\Exception $e) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}