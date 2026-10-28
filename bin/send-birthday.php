<?php

declare(strict_types=1);

use App\AccessGuard;
use App\Story;
use App\StoryProgress;
use App\TelegramBot;

require dirname(__DIR__) . '/vendor/autoload.php';

$root = dirname(__DIR__);
Dotenv\Dotenv::createImmutable($root)->safeLoad();
$timezone = new DateTimeZone($_ENV['APP_TIMEZONE'] ?? 'Asia/Tashkent');
date_default_timezone_set($timezone->getName());

$storage = $root . '/storage';
// The token may come from .env or from the environment (e.g. macOS Keychain via bin/start-bot.sh).
$token = (string) ($_ENV['TELEGRAM_BOT_TOKEN'] ?? '') ?: (string) getenv('TELEGRAM_BOT_TOKEN');
$dryRun = ($_ENV['ENABLE_REAL_BIRTHDAY_SEND'] ?? '0') !== '1';

// Always send to ALLOWED_TELEGRAM_USER_ID: in a private chat the chat id equals the user id.
$recipientId = AccessGuard::recipientId();
if ($recipientId === '') {
    fwrite(STDERR, "ALLOWED_TELEGRAM_USER_ID is empty. Set her Telegram ID in .env.\n");
    exit(1);
}
$recipient = ['chat_id' => $recipientId, 'user_id' => $recipientId];

$now = new DateTimeImmutable('now', $timezone);
$month = (int) ($_ENV['BIRTHDAY_MONTH'] ?? 10);
$day = (int) ($_ENV['BIRTHDAY_DAY'] ?? 30);
if (!$dryRun && ((int) $now->format('n') !== $month || (int) $now->format('j') !== $day)) {
    fwrite(STDERR, "Real sending is only allowed on the configured birthday date in {$timezone->getName()}.\n");
    exit(1);
}

$sentMarker = App\Countdown::birthdaySentMarker($storage);
if (!$dryRun && is_file($sentMarker)) {
    echo "Birthday greeting already sent for {$now->format('Y')}; duplicate prevented.\n";
    exit(0);
}

$progress = new StoryProgress($storage . '/story-progress.json');
$bot = new TelegramBot($token);
$birthdayText = App\Countdown::birthdayMessage();
$birthdayKeyboard = App\Countdown::birthdayKeyboard();

if ($dryRun) {
    printf(
        "[DRY RUN] Would publish birthday greeting to chat_id %s at %s\n\n%s\n\n",
        (string) $recipient['chat_id'],
        $now->format(DATE_ATOM),
        $birthdayText
    );
    echo "No message was sent. To enable real sending, set ENABLE_REAL_BIRTHDAY_SEND=1.\n";
    exit(0);
}

// Always send a new message: editing the countdown would not trigger a notification.
$bot->sendMessage($recipient['chat_id'], $birthdayText, $birthdayKeyboard);
$progress->reset($recipient['chat_id']);
$marker = [
    'sent_at' => $now->format(DATE_ATOM),
    'chat_id' => $recipient['chat_id'],
    'year' => (int) $now->format('Y'),
];
file_put_contents($sentMarker, json_encode($marker, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), LOCK_EX);
@chmod($sentMarker, 0600);
echo "Birthday story prologue sent successfully. Duplicate protection marker created.\n";
