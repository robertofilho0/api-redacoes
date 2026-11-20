<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'papel' => $this->papel,
            'email' => $this->email,
            'matricula' => $this->matricula,
            'serie' => $this->serie,
            'ativo' => $this->ativo,
        ];
    }
}
