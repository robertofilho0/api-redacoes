<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NotaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('professora');
    }

    public function rules(): array
    {
        $obrigatorio = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'matricula' => [$this->isMethod('POST') ? 'required' : 'prohibited', 'regex:/^\d{4,20}$/'],
            'disciplina' => ['sometimes', 'string', 'min:2', 'max:60'],
            'tema' => ['nullable', 'string', 'max:200'],
            'bimestre' => [$obrigatorio, 'integer', 'between:1,4'],
            'nota1' => [$obrigatorio, 'numeric', 'between:0,10'],
            'nota2' => [$obrigatorio, 'numeric', 'between:0,10'],
            'peso1' => ['sometimes', 'integer', 'between:1,10'],
            'peso2' => ['sometimes', 'integer', 'between:1,10'],
            'comentario' => ['nullable', 'string', 'max:2000'],
            'media' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return ['media.prohibited' => 'A média é calculada automaticamente.'];
    }
}
