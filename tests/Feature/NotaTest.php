<?php

namespace Tests\Feature;

use App\Models\Nota;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotaTest extends TestCase
{
    use RefreshDatabase;

    private User $professora;

    private User $ana;

    private User $bruno;

    protected function setUp(): void
    {
        parent::setUp();
        $this->professora = User::factory()->professora()->create(['name' => 'Beth']);
        $this->ana = User::factory()->aluno('3A')->create(['name' => 'Ana Lima', 'matricula' => '2025001']);
        $this->bruno = User::factory()->aluno('3B')->create(['name' => 'Bruno Costa', 'matricula' => '2025002']);
    }

    private function lancar(array $dados = [])
    {
        Sanctum::actingAs($this->professora);

        return $this->postJson('/api/notas', ['matricula' => '2025001', 'bimestre' => 1, 'nota1' => 8, 'nota2' => 9, ...$dados]);
    }

    public function test_calcula_a_media_ponderada(): void
    {
        $this->lancar(['media' => 0])->assertUnprocessable()->assertJsonValidationErrors('media');

        $this->lancar(['tema' => 'Educação digital'])
            ->assertCreated()
            ->assertJsonPath('data.media', 8.67)
            ->assertJsonPath('data.disciplina', 'Redação')
            ->assertJsonPath('data.aluno.matricula', '2025001')
            ->assertJsonPath('data.lancada_por', 'Beth');
    }

    public function test_respeita_pesos_e_valida_faixas(): void
    {
        $this->lancar(['nota1' => 6, 'nota2' => 10, 'peso1' => 1, 'peso2' => 1])->assertJsonPath('data.media', 8);
        $this->lancar(['nota1' => 11, 'nota2' => -1, 'bimestre' => 5])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['nota1', 'nota2', 'bimestre']);
        $this->lancar(['matricula' => '9999'])->assertNotFound();
    }

    public function test_aluno_nao_lanca_edita_nem_remove(): void
    {
        $nota = Nota::factory()->create(['aluno_id' => $this->ana->id]);
        Sanctum::actingAs($this->ana);

        $this->postJson('/api/notas', ['matricula' => '2025001', 'bimestre' => 1, 'nota1' => 10, 'nota2' => 10])->assertForbidden();
        $this->putJson("/api/notas/{$nota->id}", ['nota1' => 10])->assertForbidden();
        $this->deleteJson("/api/notas/{$nota->id}")->assertForbidden();
    }

    public function test_atualiza_recalculando_e_remove(): void
    {
        $id = $this->lancar()->json('data.id');

        $this->putJson("/api/notas/{$id}", ['nota2' => 6])->assertJsonPath('data.media', 6.67);
        $this->deleteJson("/api/notas/{$id}")->assertNoContent();
        $this->deleteJson("/api/notas/{$id}")->assertNotFound();
    }

    public function test_aluno_ve_apenas_as_proprias_notas(): void
    {
        $this->lancar();
        $this->lancar(['matricula' => '2025002']);

        Sanctum::actingAs($this->ana);
        $this->getJson('/api/notas?matricula=2025002')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.aluno.matricula', '2025001');
    }

    public function test_professora_filtra_notas(): void
    {
        $this->lancar(['bimestre' => 1]);
        $this->lancar(['bimestre' => 2]);
        $this->lancar(['matricula' => '2025002']);

        $this->getJson('/api/notas')->assertJsonPath('meta.total', 3);
        $this->getJson('/api/notas?serie=3B')->assertJsonPath('data.0.aluno.matricula', '2025002');
        $this->getJson('/api/notas?bimestre=2')->assertJsonPath('meta.total', 1);
    }

    public function test_boletim_com_medias_e_situacao(): void
    {
        $this->lancar(['bimestre' => 1, 'nota1' => 8, 'nota2' => 9]);
        $this->lancar(['bimestre' => 2, 'nota1' => 4, 'nota2' => 5]);

        Sanctum::actingAs($this->ana);
        $this->getJson('/api/notas/aluno/2025001')
            ->assertOk()
            ->assertJsonPath('aluno.name', 'Ana Lima')
            ->assertJsonPath('bimestres.0.media', 8.67)
            ->assertJsonPath('bimestres.1.media', 4.67)
            ->assertJsonPath('bimestres.2.media', null)
            ->assertJsonPath('media_geral', 6.67)
            ->assertJsonPath('situacao', 'aprovado');

        $this->getJson('/api/notas/aluno/2025002')->assertForbidden();
    }

    public function test_estatisticas_da_turma(): void
    {
        $this->lancar(['bimestre' => 1, 'nota1' => 8, 'nota2' => 9]);
        $this->lancar(['matricula' => '2025002', 'bimestre' => 1, 'nota1' => 10, 'nota2' => 10]);
        $this->lancar(['bimestre' => 2, 'nota1' => 4, 'nota2' => 5]);

        $this->getJson('/api/notas/estatisticas?bimestre=1')
            ->assertOk()
            ->assertJsonPath('total', 2)
            ->assertJsonPath('media_turma', 9.34)
            ->assertJsonPath('maior', 10)
            ->assertJsonPath('acima_da_media', 2)
            ->assertJsonPath('distribuicao.excelente', 1)
            ->assertJsonPath('distribuicao.bom', 1);

        Sanctum::actingAs($this->ana);
        $this->getJson('/api/notas/estatisticas')->assertForbidden();
    }
}
