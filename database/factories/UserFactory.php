<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Aluno: login por matrícula, sem e-mail.
     */
    public function aluno(string $serie = '3A'): static
    {
        return $this->state(fn (array $attributes) => [
            'papel' => 'aluno',
            'email' => null,
            'matricula' => (string) fake()->unique()->numberBetween(2025000, 2025999),
            'serie' => $serie,
        ]);
    }

    /**
     * Professora: login por e-mail.
     */
    public function professora(): static
    {
        return $this->state(fn (array $attributes) => [
            'papel' => 'professora',
            'matricula' => null,
            'serie' => null,
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
