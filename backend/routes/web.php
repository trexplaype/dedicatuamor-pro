<?php

use App\Http\Controllers\UserPageController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/{slug}', [UserPageController::class, 'publicPage'])
    ->where('slug', '^(?!api|storage|admin|login|register|sanctum).+');