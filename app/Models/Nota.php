<?php

namespace App\Models;

use Database\Factories\NotaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Nota extends Model
{
    /** @use HasFactory<NotaFactory> */
    use HasFactory;

    protected $fillable = ['aluno_id', 'professora_id', 'disciplina', 'tema', 'bimestre', 'nota1', 'nota2', 'peso1', 'peso2', 'comentario'];

    protected $attributes = [
        'disciplina' => 'Redação',
        'peso1' => 1,
        'peso2' => 2,
    ];

    protected function casts(): array
    {
        return [
            'bimestre' => 'integer',
            'nota1' => 'float',
            'nota2' => 'float',
            'peso1' => 'integer',
            'peso2' => 'integer',
            'media' => 'float',
        ];
    }

    /** A média é sempre calculada pela aplicação, nunca enviada pelo cliente. */
    protected static function booted(): void
    {
        static::saving(function (Nota $nota) {
            $nota->media = self::calcularMedia($nota->nota1, $nota->nota2, $nota->peso1, $nota->peso2);
        });
    }

    /** (nota1 × peso1 + nota2 × peso2) / (peso1 + peso2), arredondada em 2 casas. */
    public static function calcularMedia(float $nota1, float $nota2, int $peso1 = 1, int $peso2 = 2): float
    {
        return round(($nota1 * $peso1 + $nota2 * $peso2) / ($peso1 + $peso2), 2);
    }

    public function aluno(): BelongsTo
    {
        return $this->belongsTo(User::class, 'aluno_id');
    }

    public function professora(): BelongsTo
    {
        return $this->belongsTo(User::class, 'professora_id');
    }
}
