<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index()
    {
        return response()->json(Article::orderBy('created_at', 'desc')->get());
    }

    public function getLatestOriginal()
    {
        $article = Article::where('is_updated', 0)->latest()->first();
        return response()->json($article);
    }

    public function store(Request $request)
    {
        $article = Article::create($request->all());
        return response()->json($article, 201);
    }
}