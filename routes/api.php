<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NotaController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/alunos', [UserController::class, 'alunos']);
    Route::patch('/users/{user}', [UserController::class, 'update']);

    Route::get('/notas/estatisticas', [NotaController::class, 'estatisticas']);
    Route::get('/notas/aluno/{matricula}', [NotaController::class, 'boletim']);
    Route::apiResource('notas', NotaController::class)->except('show');
});
