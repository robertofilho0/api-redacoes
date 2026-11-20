<?php

namespace App\Services;

use App\Http\Resources\NotaResource;
use App\Models\User;
use Illuminate\Support\Collection;

class BoletimService
{
    private static function media(Collection $valores): ?float
    {
        return $valores->isEmpty() ? null : round($valores->avg(), 2);
    }

    /** Média por bimestre, média geral e situação do aluno. */
    public function boletim(User $aluno): array
    {
        $notas = $aluno->notas()->with('professora')->get();
        $mediaAprovacao = config('escola.media_aprovacao');

        $bimestres = collect(range(1, 4))->map(function (int $bimestre) use ($notas) {
            $doBimestre = $notas->where('bimestre', $bimestre)->values();

            return [
                'bimestre' => $bimestre,
                'quantidade' => $doBimestre->count(),
                'media' => self::media($doBimestre->pluck('media')),
                'notas' => NotaResource::collection($doBimestre),
            ];
        });

        $mediaGeral = self::media($bimestres->pluck('media')->filter(fn ($m) => $m !== null));

        return [
            'aluno' => ['id' => $aluno->id, 'name' => $aluno->name, 'matricula' => $aluno->matricula, 'serie' => $aluno->serie],
            'media_geral' => $mediaGeral,
            'media_aprovacao' => $mediaAprovacao,
            'situacao' => match (true) {
                $mediaGeral === null => 'sem_notas',
                $mediaGeral >= $mediaAprovacao => 'aprovado',
                default => 'abaixo_da_media',
            },
            'bimestres' => $bimestres,
        ];
    }

    /** Estatísticas a partir de uma lista de médias. */
    public function estatisticas(Collection $medias): array
    {
        $mediaAprovacao = config('escola.media_aprovacao');

        return [
            'total' => $medias->count(),
            'media_turma' => self::media($medias),
            'maior' => $medias->max(),
            'menor' => $medias->min(),
            'acima_da_media' => $medias->filter(fn ($m) => $m >= $mediaAprovacao)->count(),
            // insuficiente: < 5 | regular: 5 a 6,9 | bom: 7 a 8,9 | excelente: 9 a 10
            'distribuicao' => [
                'insuficiente' => $medias->filter(fn ($m) => $m < 5)->count(),
                'regular' => $medias->filter(fn ($m) => $m >= 5 && $m < 7)->count(),
                'bom' => $medias->filter(fn ($m) => $m >= 7 && $m < 9)->count(),
                'excelente' => $medias->filter(fn ($m) => $m >= 9)->count(),
            ],
        ];
    }
}
