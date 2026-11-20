<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return (new UserResource($user->fresh()))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function alunos(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('professora');

        $filtros = $request->validate([
            'serie' => ['nullable', 'string', 'max:20'],
            'busca' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'between:1,100'],
        ]);

        $alunos = User::alunos()
            ->when($filtros['serie'] ?? null, fn ($q, $serie) => $q->where('serie', $serie))
            ->when($filtros['busca'] ?? null, fn ($q, $termo) => $q->where(
                fn ($w) => $w->where('name', 'like', "%{$termo}%")->orWhere('matricula', 'like', "{$termo}%")
            ))
            ->orderBy('name')
            ->paginate($filtros['per_page'] ?? 50)
            ->withQueryString();

        return UserResource::collection($alunos);
    }

    public function update(UpdateUserRequest $request, User $user): UserResource
    {
        abort_if(
            $request->user()->is($user) && $request->has('ativo') && ! $request->boolean('ativo'),
            Response::HTTP_UNPROCESSABLE_ENTITY,
            'Você não pode desativar a própria conta.',
        );

        $user->update($request->validated());

        return new UserResource($user);
    }
}
