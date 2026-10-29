<?php

declare(strict_types=1);

namespace App;

use DateTimeImmutable;
use DateTimeZone;

final class Countdown
{
    public static function target(): DateTimeImmutable
    {
        $timezone = new DateTimeZone($_ENV['APP_TIMEZONE'] ?? 'Asia/Tashkent');
        $month = max(1, min(12, (int) ($_ENV['BIRTHDAY_MONTH'] ?? 10)));
        $day = max(1, min(31, (int) ($_ENV['BIRTHDAY_DAY'] ?? 30)));
        $hour = max(0, min(23, (int) ($_ENV['BIRTHDAY_HOUR'] ?? 0)));
        $minute = max(0, min(59, (int) ($_ENV['BIRTHDAY_MINUTE'] ?? 0)));
        $now = new DateTimeImmutable('now', $timezone);
        $year = (int) $now->format('Y');
        $target = self::makeTarget($year, $month, $day, $hour, $minute, $timezone);

        if ($target <= $now && $now->format('Y-m-d') !== $target->format('Y-m-d')) {
            $target = self::makeTarget($year + 1, $month, $day, $hour, $minute, $timezone);
        }

        return $target;
    }

    public static function message(): string
    {
        $timezone = new DateTimeZone($_ENV['APP_TIMEZONE'] ?? 'Asia/Tashkent');
        $now = new DateTimeImmutable('now', $timezone);
        $target = self::target();
        $seconds = max(0, $target->getTimestamp() - $now->getTimestamp());

        if ($seconds === 0) {
            return self::birthdayMessage();
        }

        $days = intdiv($seconds, 86400);
        $hours = intdiv($seconds % 86400, 3600);
        $minutes = intdiv($seconds % 3600, 60);

        $parts = [];
        if ($days > 0) {
            $parts[] = $days . ' ' . self::plural($days, 'день', 'дня', 'дней');
        }
        if ($hours > 0 || $days > 0) {
            $parts[] = $hours . ' ' . self::plural($hours, 'час', 'часа', 'часов');
        }
        $parts[] = $minutes . ' ' . self::plural($minutes, 'минута', 'минуты', 'минут');

        if ($seconds <= 86400) {
            $intro = "Совсем скоро… ❤️\n\nЯ уже мысленно обнимаю тебя и жду момента, когда смогу сказать тебе самое главное.";
        } elseif ($seconds <= 3 * 86400) {
            $intro = "Осталось совсем немного… ✨\n\nЯ готовлю для тебя маленькую историю и письмо от сердца. Пусть пока это будет наш маленький секрет.";
        } elseif ($seconds <= 7 * 86400) {
            $intro = "До твоего особенного дня меньше недели. 💫\n\nЯ хочу, чтобы это поздравление подарило тебе немного тепла еще до самого праздника.";
        } else {
            $intro = "Я приготовил для тебя кое-что особенное.\n\nПока оставлю это в секрете - пусть ожидание будет частью сюрприза. ❤️";
        }

        return "✦ HAPPY DAY MY LOVE ✦\n\n"
            . "Для моего солнышка ❤️\n\n"
            . "До 30 октября осталось:\n\n"
            . "✨ " . implode("\n✨ ", $parts) . "\n\n"
            . $intro;
    }

    public static function birthdayMessage(): string
    {
        return "✨ СЕГОДНЯ ТВОЙ ДЕНЬ ✨\n\n"
            . "Мое солнышко, с днем рождения! ❤️🎂\n\n"
            . "Я приготовил для тебя маленькую историю - несколько глав и письмо, в котором собраны самые искренние слова.\n\n"
            . "Пусть этот день принесет тебе тепло, спокойствие и много поводов улыбаться.\n\n"
            . "Когда будешь готова, нажми кнопку ниже. Я хочу рассказать тебе все это в твоем темпе. ❤️";
    }

    /** What everyone except the recipient and the author sees: the countdown and nothing else. */
    public static function guestMessage(): string
    {
        $timezone = new DateTimeZone($_ENV['APP_TIMEZONE'] ?? 'Asia/Tashkent');
        $now = new DateTimeImmutable('now', $timezone);
        $seconds = max(0, self::target()->getTimestamp() - $now->getTimestamp());
        if ($seconds === 0) {
            return "✦ HAPPY DAY MY LOVE ✦\n\nСегодня особенный день ✨\n\nЭтот сюрприз приготовлен для одного особенного человека. ❤️";
        }

        $days = intdiv($seconds, 86400);
        $hours = intdiv($seconds % 86400, 3600);
        $minutes = intdiv($seconds % 3600, 60);
        $parts = [];
        if ($days > 0) {
            $parts[] = $days . ' ' . self::plural($days, 'день', 'дня', 'дней');
        }
        if ($hours > 0 || $days > 0) {
            $parts[] = $hours . ' ' . self::plural($hours, 'час', 'часа', 'часов');
        }
        $parts[] = $minutes . ' ' . self::plural($minutes, 'минута', 'минуты', 'минут');

        return "✦ HAPPY DAY MY LOVE ✦\n\n"
            . "До 30 октября осталось:\n\n"
            . "✨ " . implode("\n✨ ", $parts) . "\n\n"
            . "Этот сюрприз приготовлен для одного особенного человека. ❤️";
    }

    public static function guestKeyboard(): array
    {
        return ['inline_keyboard' => [
            [['text' => '❤️ Обновить отсчёт', 'callback_data' => 'refresh_countdown']],
            [['text' => '💌 Поздравить', 'callback_data' => 'congrats']],
        ]];
    }

    /** Keyboard for the birthday notification: opens the Mini App surprise first. */
    public static function birthdayKeyboard(): array
    {
        $rows = [];
        $miniAppUrl = trim((string) ($_ENV['MINI_APP_URL'] ?? ''));
        if ($miniAppUrl !== '' && filter_var($miniAppUrl, FILTER_VALIDATE_URL) && str_starts_with(strtolower($miniAppUrl), 'https://')) {
            $rows[] = [['text' => '🎁 Открыть сюрприз', 'web_app' => ['url' => $miniAppUrl]]];
        }
        $rows[] = [['text' => '🎬 Начать нашу историю', 'callback_data' => 'story:prologue']];

        return ['inline_keyboard' => $rows];
    }

    /** Shared marker so the bot loop and bin/send-birthday.php never notify twice. */
    public static function birthdaySentMarker(string $storage): string
    {
        return $storage . '/birthday-sent-' . date('Y') . '.json';
    }

    public static function keyboard(): array
    {
        $rows = [];
        $miniAppUrl = trim((string) ($_ENV['MINI_APP_URL'] ?? ''));
        if ($miniAppUrl !== '' && filter_var($miniAppUrl, FILTER_VALIDATE_URL) && str_starts_with(strtolower($miniAppUrl), 'https://')) {
            $rows[] = [[
                'text' => '✨ Открыть романтический подарок',
                'web_app' => ['url' => $miniAppUrl],
            ]];
        }
        $rows[] = [
            ['text' => '❤️ Обновить отсчет', 'callback_data' => 'refresh_countdown'],
        ];
        if ($miniAppUrl === '' || !filter_var($miniAppUrl, FILTER_VALIDATE_URL) || !str_starts_with(strtolower($miniAppUrl), 'https://')) {
            $rows[] = [['text' => '🎬 Открыть историю', 'callback_data' => 'story:prologue']];
        }

        return ['inline_keyboard' => $rows];
    }

    private static function makeTarget(int $year, int $month, int $day, int $hour, int $minute, DateTimeZone $timezone): DateTimeImmutable
    {
        // Avoid PHP normalizing an invalid date such as 31 February silently.
        $date = sprintf('%04d-%02d-%02d %02d:%02d:00', $year, $month, $day, $hour, $minute);
        $target = DateTimeImmutable::createFromFormat('!Y-m-d H:i:s', $date, $timezone);
        $errors = DateTimeImmutable::getLastErrors();
        if ($target === false || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
            throw new \RuntimeException('Invalid birthday date/time configuration.');
        }

        return $target;
    }

    private static function plural(int $number, string $one, string $few, string $many): string
    {
        $n = abs($number) % 100;
        if ($n >= 11 && $n <= 19) {
            return $many;
        }
        return match (abs($number) % 10) {
            1 => $one,
            2, 3, 4 => $few,
            default => $many,
        };
    }
}
