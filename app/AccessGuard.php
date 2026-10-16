<?php

declare(strict_types=1);

namespace App;

final class AccessGuard
{
    public static function allows(int|string|null $telegramUserId): bool
    {
        $allowed = trim((string) ($_ENV['ALLOWED_TELEGRAM_USER_ID'] ?? ''));
        if ($allowed === '') {
            // Empty means development mode. Set ALLOWED_TELEGRAM_USER_ID before production.
            return true;
        }
        return $telegramUserId !== null && hash_equals($allowed, (string) $telegramUserId);
    }
}
