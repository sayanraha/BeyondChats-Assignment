<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;

Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/article/latest', [ArticleController::class, 'getLatestOriginal']);
Route::post('/articles', [ArticleController::class, 'store']);