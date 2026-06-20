<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Console Commands
|--------------------------------------------------------------------------
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Tasks
|--------------------------------------------------------------------------
|
| Expira páginas vencidas cada hora
| Elimina páginas expiradas después del tiempo configurado
|
*/

Schedule::command('pages:expire')->hourly();

Schedule::command('pages:delete-expired')->dailyAt('03:00');
