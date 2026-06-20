<?php

namespace App\Console\Commands;

use App\Models\UserPage;
use Illuminate\Console\Command;

class ExpireUserPages extends Command
{
    protected $signature = 'pages:expire';

    protected $description = 'Expira páginas vencidas';

    public function handle()
    {
        $count = UserPage::where('status', 'published')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->update([
                'status' => 'expired',
                'is_published' => false,
            ]);

        $this->info("Páginas expiradas: {$count}");

        return self::SUCCESS;
    }
}
