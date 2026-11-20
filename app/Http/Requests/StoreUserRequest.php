<?php

namespace App\Http\Requests;

use App\Enums\Papel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('professora');
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('email')) {
            $this->merge(['email' => strtolower((string) $this->input('email'))]);
        }
    }

    public function rules(): array
    {
        return [
            'papel' => ['required', Rule::enum(Papel::class)],
            'name' => ['required', 'string', 'min:3', 'max:100'],
            // Professora entra por e-mail; aluno, por matrícula
            'email' => ['required_if:papel,professora', 'prohibited_if:papel,aluno', 'email', 'max:150', 'unique:users,email'],
            'matricula' => ['required_if:papel,aluno', 'prohibited_if:papel,professora', 'regex:/^\d{4,20}$/', 'unique:users,matricula'],
            'serie' => ['required_if:papel,aluno', 'prohibited_if:papel,professora', 'string', 'max:20'],
            'password' => ['required', Password::min(8)->letters()->numbers()],
        ];
    }

    public function messages(): array
    {
        return [
            'matricula.unique' => 'Matrícula já cadastrada.',
            'email.unique' => 'E-mail já cadastrado.',
        ];
    }
}
