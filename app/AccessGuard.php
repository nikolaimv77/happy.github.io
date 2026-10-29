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

    /** Full functionality: the author and the recipient, or everyone when the author opened it for all. */
    public static function allows(int|string|null $telegramUserId, bool $openForAll = false): bool
    {
        if ($openForAll || self::isOwner($telegramUserId)) {
            return true;
        }
        return self::isRecipient($telegramUserId);
    }

    /** The birthday girl: full access on 30.10, receives the notification. */
    public static function isRecipient(int|string|null $telegramUserId): bool
    {
        $allowed = self::recipientId();
        return $allowed !== '' && $telegramUserId !== null && hash_equals($allowed, (string) $telegramUserId);
    }

    public static function recipientId(): string
    {
        return trim((string) ($_ENV['ALLOWED_TELEGRAM_USER_ID'] ?? ''));
    }
}
