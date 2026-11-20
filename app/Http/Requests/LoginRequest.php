<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email' => ['required_without:matricula', 'prohibits:matricula', 'email'],
            'matricula' => ['required_without:email', 'string', 'regex:/^\d{4,20}$/'],
            'password' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required_without' => 'Informe o e-mail (professora) ou a matrícula (aluno).',
            'matricula.required_without' => 'Informe o e-mail (professora) ou a matrícula (aluno).',
            'email.prohibits' => 'Informe apenas o e-mail ou a matrícula.',
        ];
    }
}
