<?php

namespace App\Controllers;

use App\Models\WishListModel;
use App\Models\Auth;

class WishListController extends BaseController
{
    private $model;

    public function __construct()
    {
        parent::__construct();
        $this->model = new WishListModel();
    }

    /**
     * Display student's wish-list (SFx23)
     */
    public function index()
    {
        // Check permissions: only students can view their wish-list
        if (!Auth::hasRole('student')) {
            http_response_code(403);
            echo 'Forbidden - Only students can access wish-list';
            return;
        }

        $user = Auth::user();
        $wishList = $this->model->getStudentWishList($user['id']);
        $wishListCount = $this->model->getWishListCount($user['id']);

        $this->render('wishlist', [
            'title' => 'My Wish List',
            'wishList' => $wishList,
            'wishListCount' => $wishListCount,
            'user' => $user
        ]);
    }

    public function add()
    {
        // Check permissions: only students can modify their wish-list
        if (!Auth::hasRole('student')) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden - Only students can modify wish-list']);
            return;
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            return;
        }

        $internshipId = $_POST['internshipId'] ?? null;
        if (!$internshipId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Internship ID required']);
            return;
        }

        $user = Auth::user();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not logged in']);
            return;
        }

        $result = $this->model->addToWishList($user['id'], $internshipId);

        if ($result['success']) {
            echo json_encode(['success' => true, 'message' => $result['message']]);
        } else {
            echo json_encode(['success' => false, 'message' => $result['message']]);
        }
    }

    /**
     * Remove internship from wish-list (SFx25)
     */
    public function remove()
    {
        // Check permissions: only students can modify their wish-list
        if (!Auth::hasRole('student')) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden - Only students can modify wish-list']);
            return;
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            return;
        }

        $internshipId = $_POST['internshipId'] ?? null;
        if (!$internshipId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Internship ID required']);
            return;
        }

        $user = Auth::user();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not logged in']);
            return;
        }

        $result = $this->model->removeFromWishList($user['id'], $internshipId);

        if ($result['success']) {
            echo json_encode(['success' => true, 'message' => $result['message']]);
        } else {
            echo json_encode(['success' => false, 'message' => $result['message']]);
        }
    }

    /**
     * Check if internship is in wish-list (AJAX endpoint)
     */
    public function check()
    {
        // Check permissions: only students can check their wish-list
        if (!Auth::hasRole('student')) {
            http_response_code(403);
            echo json_encode(['inWishlist' => false]);
            return;
        }

        $internshipId = $_GET['internshipId'] ?? null;
        if (!$internshipId) {
            http_response_code(400);
            echo json_encode(['inWishlist' => false]);
            return;
        }

        $user = Auth::user();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['inWishlist' => false]);
            return;
        }
        $inWishlist = $this->model->isInWishList($user['id'], $internshipId);

        echo json_encode(['inWishlist' => $inWishlist]);
    }
}