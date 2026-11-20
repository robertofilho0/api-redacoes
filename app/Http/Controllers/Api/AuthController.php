<?php

namespace App\Http\Controllers\Api;

use App\Enums\Papel;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /** Professora entra por e-mail; aluno, por matrícula. Ambos com senha. */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = $request->filled('email')
            ? User::where('email', strtolower($request->input('email')))->where('papel', Papel::Professora->value)->first()
            : User::where('matricula', $request->input('matricula'))->where('papel', Papel::Aluno->value)->first();

        if (! $user || ! Hash::check($request->input('password'), $user->password)) {
            throw ValidationException::withMessages(['login' => 'Credenciais inválidas.'])
                ->status(Response::HTTP_UNAUTHORIZED);
        }
        abort_unless($user->ativo, Response::HTTP_FORBIDDEN, 'Usuário desativado.');

        $token = $user->createToken('api');

        return response()->json([
            'access_token' => $token->plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $token->accessToken->expires_at,
            'user' => new UserResource($user),
        ]);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request): Response
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }
}
