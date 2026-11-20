<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\NotaRequest;
use App\Http\Resources\NotaResource;
use App\Models\Nota;
use App\Models\User;
use App\Services\BoletimService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class NotaController extends Controller
{
    public function __construct(private readonly BoletimService $boletim) {}

    private function alunoPorMatricula(string $matricula): User
    {
        return User::alunos()->where('matricula', $matricula)->firstOr(
            fn () => abort(Response::HTTP_NOT_FOUND, 'Aluno não encontrado.')
        );
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $filtros = $request->validate([
            'matricula' => ['nullable', 'string'],
            'serie' => ['nullable', 'string', 'max:20'],
            'bimestre' => ['nullable', 'integer', 'between:1,4'],
            'disciplina' => ['nullable', 'string', 'max:60'],
            'per_page' => ['nullable', 'integer', 'between:1,100'],
        ]);
        $user = $request->user();

        $notas = Nota::with('aluno')
            // O aluno só enxerga as próprias notas
            ->when(! $user->isProfessora(), fn ($q) => $q->where('aluno_id', $user->id))
            ->when($user->isProfessora() && ($filtros['matricula'] ?? null), fn ($q) => $q->whereRelation('aluno', 'matricula', $filtros['matricula']))
            ->when($filtros['serie'] ?? null, fn ($q, $serie) => $q->whereRelation('aluno', 'serie', $serie))
            ->when($filtros['bimestre'] ?? null, fn ($q, $bimestre) => $q->where('bimestre', $bimestre))
            ->when($filtros['disciplina'] ?? null, fn ($q, $disciplina) => $q->where('disciplina', $disciplina))
            ->orderBy('bimestre')
            ->orderBy('id')
            ->paginate($filtros['per_page'] ?? 50)
            ->withQueryString();

        return NotaResource::collection($notas);
    }

    public function store(NotaRequest $request): JsonResponse
    {
        $aluno = $this->alunoPorMatricula($request->validated('matricula'));
        $nota = $aluno->notas()->create([
            ...$request->safe()->except('matricula'),
            'professora_id' => $request->user()->id,
        ]);

        return (new NotaResource($nota->load('aluno', 'professora')))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(NotaRequest $request, Nota $nota): NotaResource
    {
        $nota->update($request->validated());

        return new NotaResource($nota->load('aluno', 'professora'));
    }

    public function destroy(Nota $nota): Response
    {
        Gate::authorize('professora');
        $nota->delete();

        return response()->noContent();
    }

    public function boletim(string $matricula): JsonResponse
    {
        $aluno = $this->alunoPorMatricula($matricula);
        Gate::authorize('ver-boletim', $aluno);

        return response()->json($this->boletim->boletim($aluno));
    }

    public function estatisticas(Request $request): JsonResponse
    {
        Gate::authorize('professora');
        $filtros = $request->validate([
            'serie' => ['nullable', 'string', 'max:20'],
            'bimestre' => ['nullable', 'integer', 'between:1,4'],
        ]);

        $medias = Nota::query()
            ->when($filtros['bimestre'] ?? null, fn ($q, $b) => $q->where('bimestre', $b))
            ->when($filtros['serie'] ?? null, fn ($q, $s) => $q->whereRelation('aluno', 'serie', $s))
            ->pluck('media')
            ->map(fn ($m) => (float) $m);

        return response()->json([
            'filtros' => ['serie' => $filtros['serie'] ?? null, 'bimestre' => isset($filtros['bimestre']) ? (int) $filtros['bimestre'] : null],
            ...$this->boletim->estatisticas($medias),
        ]);
    }
}
