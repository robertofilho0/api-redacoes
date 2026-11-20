<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'disciplina' => $this->disciplina,
            'tema' => $this->tema,
            'bimestre' => $this->bimestre,
            'nota1' => $this->nota1,
            'nota2' => $this->nota2,
            'peso1' => $this->peso1,
            'peso2' => $this->peso2,
            'media' => $this->media,
            'comentario' => $this->comentario,
            'aluno' => $this->whenLoaded('aluno', fn () => [
                'id' => $this->aluno->id,
                'name' => $this->aluno->name,
                'matricula' => $this->aluno->matricula,
                'serie' => $this->aluno->serie,
            ]),
            'lancada_por' => $this->whenLoaded('professora', fn () => $this->professora?->name),
            'updated_at' => $this->updated_at,
        ];
    }
}
