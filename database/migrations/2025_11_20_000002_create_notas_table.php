<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aluno_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('professora_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('disciplina', 60)->default('Redação');
            $table->string('tema', 200)->nullable();
            $table->unsignedTinyInteger('bimestre');
            $table->decimal('nota1', 4, 2);
            $table->decimal('nota2', 4, 2);
            $table->unsignedTinyInteger('peso1')->default(1);
            $table->unsignedTinyInteger('peso2')->default(2);
            $table->decimal('media', 4, 2);
            $table->text('comentario')->nullable();
            $table->timestamps();

            $table->index(['aluno_id', 'bimestre']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notas');
    }
};
