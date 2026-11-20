<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        User::factory()->professora()->create(['email' => 'beth@escola.com', 'password' => 'Senha123']);
        User::factory()->aluno()->create(['matricula' => '2025001', 'password' => 'Senha123']);
    }

    public function test_professora_entra_com_email(): void
    {
        $this->postJson('/api/login', ['email' => 'BETH@escola.com', 'password' => 'Senha123'])
            ->assertOk()
            ->assertJsonPath('user.papel', 'professora')
            ->assertJsonMissingPath('user.password');
    }

    public function test_aluno_entra_com_matricula_e_senha(): void
    {
        $this->postJson('/api/login', ['matricula' => '2025001', 'password' => 'Senha123'])
            ->assertOk()
            ->assertJsonPath('user.papel', 'aluno');
    }

    public function test_aluno_nao_entra_sem_senha(): void
    {
        $this->postJson('/api/login', ['matricula' => '2025001'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password');
    }

    public function test_credenciais_invalidas_tem_a_mesma_resposta(): void
    {
        $errada = $this->postJson('/api/login', ['matricula' => '2025001', 'password' => 'Errada123'])->assertUnauthorized();
        $inexistente = $this->postJson('/api/login', ['matricula' => '9999', 'password' => 'Senha123'])->assertUnauthorized();

        $this->assertSame($errada->json(), $inexistente->json());
    }

    public function test_aluno_nao_loga_como_professora(): void
    {
        User::factory()->aluno()->create(['email' => 'aluno@x.com', 'password' => 'Senha123']);

        $this->postJson('/api/login', ['email' => 'aluno@x.com', 'password' => 'Senha123'])->assertUnauthorized();
    }

    public function test_exige_email_ou_matricula_mas_nao_ambos(): void
    {
        $this->postJson('/api/login', ['password' => 'Senha123'])->assertUnprocessable();
        $this->postJson('/api/login', ['email' => 'beth@escola.com', 'matricula' => '2025001', 'password' => 'Senha123'])
            ->assertUnprocessable();
    }

    public function test_bloqueia_usuario_desativado(): void
    {
        User::factory()->aluno()->create(['matricula' => '2025009', 'password' => 'Senha123', 'ativo' => false]);

        $this->postJson('/api/login', ['matricula' => '2025009', 'password' => 'Senha123'])->assertForbidden();
    }

    public function test_me_e_logout(): void
    {
        $token = $this->postJson('/api/login', ['matricula' => '2025001', 'password' => 'Senha123'])->json('access_token');

        $this->withToken($token)->getJson('/api/me')->assertJsonPath('data.matricula', '2025001');
        $this->withToken($token)->postJson('/api/logout')->assertNoContent();
    }

    public function test_rotas_exigem_token(): void
    {
        $this->getJson('/api/notas')->assertUnauthorized();
    }
}
