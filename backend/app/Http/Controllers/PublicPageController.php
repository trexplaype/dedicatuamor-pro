<?php

namespace App\Http\Controllers;

class PublicPageController extends Controller
{
    public function show($slug)
    {
        return app(UserPageController::class)->publicPage($slug);
    }

    public function showWithLink($publicLink, $slug)
    {
        return app(UserPageController::class)->publicPage($slug);
    }
}