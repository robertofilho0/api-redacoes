<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    private function comoProfessora(): User
    {
        $professora = User::factory()->professora()->create();
        Sanctum::actingAs($professora);

        return $professora;
    }

    public function test_somente_professora_cadastra_usuarios(): void
    {
        Sanctum::actingAs(User::factory()->aluno()->create());

        $this->postJson('/api/users', ['papel' => 'professora', 'name' => 'Hacker', 'email' => 'h@x.com', 'password' => 'Senha123'])
            ->assertForbidden();
    }

    public function test_professora_cadastra_aluno_e_impede_matricula_duplicada(): void
    {
        $this->comoProfessora();
        $novo = ['papel' => 'aluno', 'name' => 'Bruno Costa', 'matricula' => '2025002', 'serie' => '3A', 'password' => 'Senha123'];

        $this->postJson('/api/users', $novo)
            ->assertCreated()
            ->assertJsonPath('data.papel', 'aluno')
            ->assertJsonPath('data.ativo', true)
            ->assertJsonMissingPath('data.password');

        $this->postJson('/api/users', $novo)->assertUnprocessable()->assertJsonValidationErrors('matricula');
    }

    public function test_valida_campos_por_papel(): void
    {
        $this->comoProfessora();

        $this->postJson('/api/users', ['papel' => 'aluno', 'name' => 'Sem Matrícula', 'serie' => '3A', 'password' => 'Senha123'])
            ->assertJsonValidationErrors('matricula');
        $this->postJson('/api/users', ['papel' => 'professora', 'name' => 'Profa', 'password' => 'Senha123'])
            ->assertJsonValidationErrors('email');
        $this->postJson('/api/users', ['papel' => 'professora', 'name' => 'Profa', 'email' => 'p@x.com', 'password' => '123'])
            ->assertJsonValidationErrors('password');
    }

    public function test_lista_e_busca_alunos(): void
    {
        $this->comoProfessora();
        User::factory()->aluno('3A')->create(['name' => 'Ana Lima']);
        User::factory()->aluno('3B')->create(['name' => 'Bruno Costa']);

        $this->getJson('/api/users/alunos')->assertJsonPath('meta.total', 2);
        $this->getJson('/api/users/alunos?serie=3B')->assertJsonPath('data.0.name', 'Bruno Costa');
        $this->getJson('/api/users/alunos?busca=ana')->assertJsonCount(1, 'data');
    }

    public function test_desativa_aluno_mas_nao_a_propria_conta(): void
    {
        $professora = $this->comoProfessora();
        $aluno = User::factory()->aluno()->create();

        $this->patchJson("/api/users/{$aluno->id}", ['ativo' => false])->assertJsonPath('data.ativo', false);
        $this->patchJson("/api/users/{$professora->id}", ['ativo' => false])->assertUnprocessable();
    }
}
