<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait HasUniqueSlug
{
    protected static function bootHasUniqueSlug()
    {
        static::creating(function ($model) {
            if (! empty($model->slug)) {
                return;
            }

            $source = $model->slugSource();
            $model->slug = static::generateUniqueSlug($model->{$source});
        });

        static::updating(function ($model) {
            $source = $model->slugSource();

            if (! $model->isDirty($source)) {
                return;
            }

            $model->slug = static::generateUniqueSlug($model->{$source}, $model->id);
        });
    }

    protected static function generateUniqueSlug(string $text, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($text);
        $slug = $baseSlug;
        $counter = 2;

        while (
            static::where('slug', $slug)
                ->when($ignoreId, function ($query) use ($ignoreId) {
                    $query->where('id', '!=', $ignoreId);
                })
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    protected function slugSource(): string
    {
        return 'name';
    }
}
