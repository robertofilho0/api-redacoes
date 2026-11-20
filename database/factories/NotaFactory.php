<?php

namespace Database\Factories;

use App\Models\Nota;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Nota>
 */
class NotaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'aluno_id' => User::factory()->aluno(),
            'bimestre' => 1,
            'tema' => fake('pt_BR')->sentence(5),
            'nota1' => fake()->randomFloat(1, 0, 10),
            'nota2' => fake()->randomFloat(1, 0, 10),
        ];
    }
}
