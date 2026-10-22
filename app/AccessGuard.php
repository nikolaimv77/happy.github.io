<?php

declare(strict_types=1);

namespace App;

final class AccessGuard
{
    /** The author's own account: full access on any day, never saved as the recipient. */
    public static function isOwner(int|string|null $telegramUserId): bool
    {
        $owner = trim((string) ($_ENV['OWNER_TELEGRAM_USER_ID'] ?? ''));
        return $owner !== '' && $telegramUserId !== null && hash_equals($owner, (string) $telegramUserId);
    }

    public static function allows(int|string|null $telegramUserId): bool
    {
        if (self::isOwner($telegramUserId)) {
            return true;
        }
        $allowed = trim((string) ($_ENV['ALLOWED_TELEGRAM_USER_ID'] ?? ''));
        if ($allowed === '') {
            // Empty means development mode. Set ALLOWED_TELEGRAM_USER_ID before production.
            return true;
        }
        return $telegramUserId !== null && hash_equals($allowed, (string) $telegramUserId);
    }
}
