<?php

namespace App\Console\Commands;

use App\Models\UserPage;
use Illuminate\Console\Command;

class DeleteExpiredUserPages extends Command
{
    protected $signature = 'pages:delete-expired';

    protected $description = 'Elimina páginas expiradas después del tiempo visible para admin';

    public function handle()
    {
        $pages = UserPage::with(['assets'])
            ->where('status', 'expired')
            ->whereNotNull('expires_at')
            ->get();

        $count = 0;

        foreach ($pages as $page) {
            $retentionDays = (int) ($page->admin_retention_days ?? 3);

            $deleteAt = $page->expires_at->copy()->addDays($retentionDays);

            if (now()->lessThan($deleteAt)) {
                continue;
            }

            foreach ($page->assets as $asset) {
                if (
                    $asset->source_type === 'upload' &&
                    $asset->file_path &&
                    file_exists(storage_path('app/public/'.$asset->file_path))
                ) {
                    unlink(storage_path('app/public/'.$asset->file_path));
                }

                $asset->delete();
            }

            $page->delete();
            $count++;
        }

        $this->info("Páginas eliminadas: {$count}");

        return self::SUCCESS;
    }
}
