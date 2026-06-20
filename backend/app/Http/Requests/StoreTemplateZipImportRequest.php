<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTemplateZipImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'zip_file' => [
                'required',
                'file',
                'mimes:zip',
                'max:1024000', // 1 GB
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'zip_file.required' => 'Debes seleccionar un archivo ZIP.',
            'zip_file.file' => 'El archivo enviado no es válido.',
            'zip_file.mimes' => 'Solo se permiten archivos ZIP.',
            'zip_file.max' => 'El ZIP no puede superar 1 GB.',
        ];
    }
}
