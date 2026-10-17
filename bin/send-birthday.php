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
$recipientFile = $storage . '/recipient.json';
$token = $_ENV['TELEGRAM_BOT_TOKEN'] ?? '';
$dryRun = ($_ENV['ENABLE_REAL_BIRTHDAY_SEND'] ?? '0') !== '1';

if (!is_file($recipientFile)) {
    fwrite(STDERR, "No recipient found. Ask the recipient to open the bot and press /start first.\n");
    exit(1);
}

$recipient = json_decode((string) file_get_contents($recipientFile), true);
if (!is_array($recipient) || empty($recipient['chat_id'])) {
    fwrite(STDERR, "Recipient data is invalid.\n");
    exit(1);
}

if (!AccessGuard::allows($recipient['user_id'] ?? null)) {
    fwrite(STDERR, "Stored recipient does not match ALLOWED_TELEGRAM_USER_ID. Refusing to send.\n");
    exit(1);
}

$now = new DateTimeImmutable('now', $timezone);
$month = (int) ($_ENV['BIRTHDAY_MONTH'] ?? 10);
$day = (int) ($_ENV['BIRTHDAY_DAY'] ?? 30);
if (!$dryRun && ((int) $now->format('n') !== $month || (int) $now->format('j') !== $day)) {
    fwrite(STDERR, "Real sending is only allowed on the configured birthday date in {$timezone->getName()}.\n");
    exit(1);
}

$sentMarker = $storage . '/birthday-sent-' . $now->format('Y') . '.json';
if (!$dryRun && is_file($sentMarker)) {
    echo "Birthday greeting already sent for {$now->format('Y')}; duplicate prevented.\n";
    exit(0);
}

$progress = new StoryProgress($storage . '/story-progress.json');
$bot = new TelegramBot($token);
$birthdayText = App\Countdown::birthdayMessage();
$birthdayKeyboard = ['inline_keyboard' => [[['text' => '🎬 Начать нашу историю', 'callback_data' => 'story:prologue']]]];
$countdownFile = $storage . '/countdown-message.json';
$countdown = is_file($countdownFile)
    ? json_decode((string) file_get_contents($countdownFile), true)
    : null;

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

// Prefer replacing the existing countdown message, so the birthday greeting does not arrive twice.
if (is_array($countdown)
    && (string) ($countdown['chat_id'] ?? '') === (string) $recipient['chat_id']
    && !empty($countdown['message_id'])) {
    try {
        $bot->editMessageText($recipient['chat_id'], (int) $countdown['message_id'], $birthdayText, $birthdayKeyboard);
    } catch (Throwable $e) {
        if (!str_contains($e->getMessage(), 'message is not modified')) {
            throw $e;
        }
    }
} else {
    $bot->sendMessage($recipient['chat_id'], $birthdayText, $birthdayKeyboard);
}
$progress->reset($recipient['chat_id']);
$marker = [
    'sent_at' => $now->format(DATE_ATOM),
    'chat_id' => $recipient['chat_id'],
    'year' => (int) $now->format('Y'),
];
file_put_contents($sentMarker, json_encode($marker, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), LOCK_EX);
@chmod($sentMarker, 0600);
echo "Birthday story prologue sent successfully. Duplicate protection marker created.\n";
