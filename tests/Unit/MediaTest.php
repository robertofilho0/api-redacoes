<?php

namespace Tests\Unit;

use App\Models\Nota;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class MediaTest extends TestCase
{
    public static function casos(): array
    {
        return [
            'pesos padrão' => [8, 9, 1, 2, 8.67],
            'pesos iguais' => [6, 10, 1, 1, 8.0],
            'zeros' => [0, 0, 1, 2, 0.0],
            'máximas' => [10, 10, 1, 2, 10.0],
        ];
    }

    #[DataProvider('casos')]
    public function test_media_ponderada(float $n1, float $n2, int $p1, int $p2, float $esperado): void
    {
        $this->assertSame($esperado, Nota::calcularMedia($n1, $n2, $p1, $p2));
    }
}
