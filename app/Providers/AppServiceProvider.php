<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::define('professora', fn (User $user) => $user->isProfessora());

        // Boletim: a professora vê todos; o aluno, só o próprio
        Gate::define('ver-boletim', fn (User $user, User $aluno) => $user->isProfessora() || $user->is($aluno));

        // Login: 5 tentativas por minuto por identificador + IP
        RateLimiter::for('login', fn (Request $request) => Limit::perMinute(5)
            ->by(strtolower((string) ($request->input('email') ?? $request->input('matricula'))).'|'.$request->ip()));

        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(120)
            ->by($request->user()?->id ?: $request->ip()));
    }
}
