<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Dados de demonstração. Senha de todos: Senha123
     * Professora: beth@escola.com | Alunos: 2025001, 2025002, 2025003
     */
    public function run(): void
    {
        $beth = User::factory()->professora()->create([
            'name' => 'Professora Beth',
            'email' => 'beth@escola.com',
            'password' => 'Senha123',
        ]);

        $alunos = [
            ['Ana Lima', '2025001', '3A', [[1, 8, 9], [2, 7.5, 8.5]]],
            ['Bruno Costa', '2025002', '3A', [[1, 5, 6], [2, 6, 7]]],
            ['Carla Dias', '2025003', '3B', [[1, 9.5, 10]]],
        ];

        foreach ($alunos as [$nome, $matricula, $serie, $notas]) {
            $aluno = User::factory()->aluno($serie)->create([
                'name' => $nome,
                'matricula' => $matricula,
                'password' => 'Senha123',
            ]);

            foreach ($notas as [$bimestre, $nota1, $nota2]) {
                $aluno->notas()->create([
                    'bimestre' => $bimestre,
                    'tema' => 'Desafios da educação digital no Brasil',
                    'nota1' => $nota1,
                    'nota2' => $nota2,
                    'professora_id' => $beth->id,
                ]);
            }
        }
    }
}
