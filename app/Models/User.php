<?php

namespace App\Models;

use App\Enums\Papel;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'papel', 'matricula', 'serie', 'ativo'];

    protected $hidden = ['password', 'remember_token'];

    protected $attributes = [
        'papel' => 'aluno',
        'ativo' => true,
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'papel' => Papel::class,
            'ativo' => 'boolean',
        ];
    }

    public function isProfessora(): bool
    {
        return $this->papel === Papel::Professora;
    }

    public function notas(): HasMany
    {
        return $this->hasMany(Nota::class, 'aluno_id')->orderBy('bimestre')->orderBy('id');
    }

    public function scopeAlunos(Builder $query): Builder
    {
        return $query->where('papel', Papel::Aluno->value);
    }
}
