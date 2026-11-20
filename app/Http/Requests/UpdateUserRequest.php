<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('professora');
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'min:3', 'max:100'],
            'serie' => ['sometimes', 'string', 'max:20'],
            'ativo' => ['sometimes', 'boolean'],
            'password' => ['sometimes', Password::min(8)->letters()->numbers()],
        ];
    }
}
