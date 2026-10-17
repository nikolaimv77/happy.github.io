<?php

declare(strict_types=1);

use App\AccessGuard;
use App\Countdown;
use App\Greeting;
use App\Story;
use App\StoryProgress;
use App\TelegramBot;

require dirname(__DIR__) . '/vendor/autoload.php';

$root = dirname(__DIR__);
Dotenv\Dotenv::createImmutable($root)->safeLoad();

date_default_timezone_set($_ENV['APP_TIMEZONE'] ?? 'Asia/Tashkent');

// The token may come from .env or from the environment (e.g. macOS Keychain via bin/start-bot.sh).
$token = (string) ($_ENV['TELEGRAM_BOT_TOKEN'] ?? '') ?: (string) getenv('TELEGRAM_BOT_TOKEN');
$storage = $root . '/storage';
$recipientFile = $storage . '/recipient.json';
$offsetFile = $storage . '/update-offset.txt';
$countdownFile = $storage . '/countdown-message.json';
$countdownImage = $root . '/content/images/midnight-romance.png';
$progress = new StoryProgress($storage . '/story-progress.json');
$lastCountdownRefresh = 0;
$birthdayTransitionFile = $storage . '/birthday-transition-' . date('Y') . '.json';

if (!is_dir($storage)) {
    mkdir($storage, 0700, true);
}

$bot = new TelegramBot($token);
$me = $bot->getMe();
printf("Bot started: @%s. Press Ctrl+C to stop.\n", $me['username'] ?? 'unknown');

$offset = is_file($offsetFile) ? (int) file_get_contents($offsetFile) : 0;

while (true) {
    try {
        $updates = $bot->getUpdates($offset);

        foreach ($updates as $update) {
            $offset = max($offset, ((int) $update['update_id']) + 1);
            file_put_contents($offsetFile, (string) $offset, LOCK_EX);

            if (isset($update['message'])) {
                $message = $update['message'];
                $chatId = $message['chat']['id'] ?? null;
                $fromId = $message['from']['id'] ?? null;
                $text = trim((string) ($message['text'] ?? ''));

                if ($chatId === null || $text === '') {
                    continue;
                }

                if (!AccessGuard::allows($fromId)) {
                    $bot->sendMessage($chatId, 'Этот подарок приготовлен для одного особенного человека. ❤️');
                    continue;
                }

                if (str_starts_with($text, '/start')) {
                    $recipient = [
                        'chat_id' => $chatId,
                        'user_id' => $fromId,
                        'first_name' => (string) ($message['from']['first_name'] ?? 'солнышко'),
                        'started_at' => date(DATE_ATOM),
                    ];
                    file_put_contents(
                        $recipientFile,
                        json_encode($recipient, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                        LOCK_EX
                    );
                    @chmod($recipientFile, 0600);

                    if (Story::isBirthdayToday()) {
                        $chapter = $progress->get($chatId);
                        $bot->sendMessage($chatId, Story::scene($chapter)['text'], Story::keyboard($chapter));
                    } else {
                        $bot->sendMessage($chatId, Greeting::start());
                        if (is_file($countdownImage)) {
                            $bot->sendPhoto($chatId, $countdownImage, 'Midnight Romance ✨\nДля моего солнышка ❤️');
                        }
                        $countdownMessage = $bot->sendMessage($chatId, Countdown::message(), Countdown::keyboard());
                        file_put_contents(
                            $countdownFile,
                            json_encode(['chat_id' => $chatId, 'message_id' => (int) ($countdownMessage['message_id'] ?? 0)], JSON_THROW_ON_ERROR),
                            LOCK_EX
                        );
                        @chmod($countdownFile, 0600);
                        $bot->sendMessage($chatId, "Когда наступит твой день, здесь откроется маленькая история из нескольких глав. ❤️\n\nКоманды: /countdown — отсчет, /story — продолжить историю, /help — помощь.");
                    }
                } elseif ($text === '/countdown') {
                    if (is_file($countdownImage)) {
                        $bot->sendPhoto($chatId, $countdownImage, 'Midnight Romance ✨\nДля моего солнышка ❤️');
                    }
                    $countdownMessage = $bot->sendMessage($chatId, Countdown::message(), Countdown::keyboard());
                    file_put_contents(
                        $countdownFile,
                        json_encode(['chat_id' => $chatId, 'message_id' => (int) ($countdownMessage['message_id'] ?? 0)], JSON_THROW_ON_ERROR),
                        LOCK_EX
                    );
                    @chmod($countdownFile, 0600);
                } elseif ($text === '/story') {
                    $chapter = Story::isBirthdayToday() ? $progress->get($chatId) : Story::PROLOGUE;
                    $bot->sendMessage($chatId, Story::scene($chapter)['text'], Story::keyboard($chapter));
                } elseif ($text === '/restart') {
                    if (!Story::isBirthdayToday()) {
                        $bot->sendMessage($chatId, 'История откроется 30 октября. Пока можно следить за обратным отсчетом. ❤️', Countdown::keyboard());
                    } else {
                        $progress->reset($chatId);
                        $bot->sendMessage($chatId, Story::scene(Story::PROLOGUE)['text'], Story::keyboard(Story::PROLOGUE));
                    }
                } elseif ($text === '/test') {
                    $bot->sendMessage($chatId, "Проверка пройдена! Бот работает. ❤️\n\nИспользуй /countdown для проверки отсчета.");
                } elseif ($text === '/help') {
                    $bot->sendMessage($chatId, "Команды Happy Day My Love ❤️\n/start — открыть бота\n/countdown — обратный отсчет\n/story — продолжить историю\n/restart — начать историю заново (30 октября)\n/test — проверить бота\n/help — помощь");
                } else {
                    $bot->sendMessage($chatId, "Мое солнышко, я приготовил для тебя особенную историю. ❤️\n\nОтправь /start, чтобы открыть подарок, или /countdown, чтобы посмотреть отсчет.");
                }
            }

            if (isset($update['callback_query'])) {
                $callback = $update['callback_query'];
                $callbackId = (string) ($callback['id'] ?? '');
                $fromId = $callback['from']['id'] ?? null;
                $data = (string) ($callback['data'] ?? '');
                $callbackChatId = $callback['message']['chat']['id'] ?? null;
                $messageId = $callback['message']['message_id'] ?? null;

                if ($callbackId === '') {
                    continue;
                }
                if (!AccessGuard::allows($fromId)) {
                    $bot->answerCallbackQuery($callbackId, 'Этот подарок приготовлен для одного особенного человека. ❤️');
                    continue;
                }

                if ($data === 'refresh_countdown' && $callbackChatId !== null && $messageId !== null) {
                    try {
                        $isBirthday = Story::isBirthdayToday();
                        $text = $isBirthday ? Countdown::birthdayMessage() : Countdown::message();
                        $keyboard = $isBirthday
                            ? Countdown::birthdayKeyboard()
                            : Countdown::keyboard();
                        $bot->editMessageText($callbackChatId, (int) $messageId, $text, $keyboard);
                    } catch (Throwable $e) {
                        if (!str_contains($e->getMessage(), 'message is not modified')) {
                            throw $e;
                        }
                    }
                    $bot->answerCallbackQuery($callbackId, Story::isBirthdayToday() ? 'С днем рождения, мое солнышко! ❤️' : 'Отсчет обновлен ❤️');
                } elseif (str_starts_with($data, 'story:') && $callbackChatId !== null) {
                    $requested = substr($data, 6);
                    $valid = [Story::PROLOGUE, Story::CHAPTER_1, Story::CHAPTER_2, Story::CHAPTER_3, Story::LETTER];
                    if (!in_array($requested, $valid, true)) {
                        $bot->answerCallbackQuery($callbackId, 'Не удалось открыть эту главу.');
                        continue;
                    }
                    if (!Story::isBirthdayToday()) {
                        $bot->answerCallbackQuery($callbackId, 'История откроется в день рождения. ❤️');
                        continue;
                    }
                    $progress->set($callbackChatId, $requested);
                    $scene = Story::scene($requested);
                    $bot->sendMessage($callbackChatId, $scene['text'], Story::keyboard($requested));
                    $bot->answerCallbackQuery($callbackId, $requested === Story::LETTER ? 'С любовью ❤️' : 'Следующая глава ❤️');
                } else {
                    $bot->answerCallbackQuery($callbackId, 'Сюрприз уже готовится ❤️');
                }
            }
        }

        // At midnight send a NEW message: edits are silent, a new message rings the phone.
        $sentMarker = Countdown::birthdaySentMarker($storage);
        if (Story::isBirthdayToday() && !is_file($sentMarker) && is_file($recipientFile)) {
            $recipient = json_decode((string) file_get_contents($recipientFile), true);
            if (is_array($recipient) && !empty($recipient['chat_id']) && AccessGuard::allows($recipient['user_id'] ?? null)) {
                try {
                    $bot->sendMessage($recipient['chat_id'], Countdown::birthdayMessage(), Countdown::birthdayKeyboard());
                    file_put_contents($sentMarker, json_encode([
                        'sent_at' => date(DATE_ATOM),
                        'chat_id' => $recipient['chat_id'],
                        'by' => 'bot',
                    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), LOCK_EX);
                    @chmod($sentMarker, 0600);
                    printf("[%s] Birthday notification sent.\n", date(DATE_ATOM));
                } catch (Throwable $e) {
                    fwrite(STDERR, '[' . date(DATE_ATOM) . '] Birthday notification: ' . $e->getMessage() . PHP_EOL);
                }
            }
        }

        // Keep the countdown fresh and replace it with the birthday greeting at midnight.
        if (is_file($countdownFile) && time() - $lastCountdownRefresh >= 60) {
            $countdown = json_decode((string) file_get_contents($countdownFile), true);
            if (is_array($countdown) && !empty($countdown['chat_id']) && !empty($countdown['message_id'])) {
                try {
                    $isBirthday = Story::isBirthdayToday();
                    $text = $isBirthday ? Countdown::birthdayMessage() : Countdown::message();
                    $keyboard = $isBirthday
                        ? Countdown::birthdayKeyboard()
                        : Countdown::keyboard();
                    $bot->editMessageText(
                        $countdown['chat_id'],
                        (int) $countdown['message_id'],
                        $text,
                        $keyboard
                    );

                    if ($isBirthday && !is_file($birthdayTransitionFile)) {
                        file_put_contents($birthdayTransitionFile, json_encode([
                            'transitioned_at' => date(DATE_ATOM),
                            'chat_id' => $countdown['chat_id'],
                            'message_id' => $countdown['message_id'],
                        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), LOCK_EX);
                        @chmod($birthdayTransitionFile, 0600);
                    }
                } catch (Throwable $e) {
                    if (!str_contains($e->getMessage(), 'message is not modified')) {
                        fwrite(STDERR, '[' . date(DATE_ATOM) . '] Countdown refresh: ' . $e->getMessage() . PHP_EOL);
                    }
                }
            }
            $lastCountdownRefresh = time();
        }
    } catch (Throwable $e) {
        fwrite(STDERR, '[' . date(DATE_ATOM) . '] ' . $e->getMessage() . PHP_EOL);
        sleep(3);
    }
}
