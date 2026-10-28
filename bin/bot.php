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
                $isOwner = AccessGuard::isOwner($fromId);
                $storyOpen = Story::isBirthdayToday() || $isOwner;

                if ($chatId === null || $text === '') {
                    continue;
                }

                if (!AccessGuard::allows($fromId)) {
                    // Guests see only the countdown: no story, no Mini App, never saved as the recipient.
                    $bot->sendMessage($chatId, Countdown::guestMessage(), Countdown::guestKeyboard());
                    continue;
                }

                if (str_starts_with($text, '/start') && $isOwner) {
                    $bot->sendMessage($chatId, "🔧 Режим автора\n\nТебе все открыто уже сейчас: история (/story, /restart) и Mini App по кнопке ниже. Получателем ты не записываешься — уведомление 30.10 уйдет ей.", Countdown::birthdayKeyboard());
                } elseif (str_starts_with($text, '/start')) {
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

                    if ($storyOpen) {
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
                    if (!$isOwner) {
                        file_put_contents(
                            $countdownFile,
                            json_encode(['chat_id' => $chatId, 'message_id' => (int) ($countdownMessage['message_id'] ?? 0)], JSON_THROW_ON_ERROR),
                            LOCK_EX
                        );
                        @chmod($countdownFile, 0600);
                    }
                } elseif ($text === '/story') {
                    $chapter = $storyOpen ? $progress->get($chatId) : Story::PROLOGUE;
                    $bot->sendMessage($chatId, Story::scene($chapter)['text'], Story::keyboard($chapter));
                } elseif ($text === '/restart') {
                    if (!$storyOpen) {
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
                $storyOpen = Story::isBirthdayToday() || AccessGuard::isOwner($fromId);
                $data = (string) ($callback['data'] ?? '');
                $callbackChatId = $callback['message']['chat']['id'] ?? null;
                $messageId = $callback['message']['message_id'] ?? null;

                if ($callbackId === '') {
                    continue;
                }
                if (!AccessGuard::allows($fromId)) {
                    if ($data === 'refresh_countdown' && $callbackChatId !== null && $messageId !== null) {
                        try {
                            $bot->editMessageText($callbackChatId, (int) $messageId, Countdown::guestMessage(), Countdown::guestKeyboard());
                        } catch (Throwable $e) {
                            if (!str_contains($e->getMessage(), 'message is not modified')) {
                                throw $e;
                            }
                        }
                        $bot->answerCallbackQuery($callbackId, 'Отсчёт обновлён ❤️');
                    } else {
                        $bot->answerCallbackQuery($callbackId, 'Этот сюрприз приготовлен для одного особенного человека. ❤️');
                    }
                    continue;
                }

                if ($data === 'refresh_countdown' && $callbackChatId !== null && $messageId !== null) {
                    try {
                        $isBirthday = $storyOpen;
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
                    $bot->answerCallbackQuery($callbackId, $storyOpen ? 'С днем рождения, мое солнышко! ❤️' : 'Отсчет обновлен ❤️');
                } elseif (str_starts_with($data, 'story:') && $callbackChatId !== null) {
                    $requested = substr($data, 6);
                    $valid = [Story::PROLOGUE, Story::CHAPTER_1, Story::CHAPTER_2, Story::CHAPTER_3, Story::LETTER];
                    if (!in_array($requested, $valid, true)) {
                        $bot->answerCallbackQuery($callbackId, 'Не удалось открыть эту главу.');
                        continue;
                    }
                    if (!$storyOpen) {
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

        // At midnight send a NEW message to her: edits are silent, a new message rings the phone.
        // A private chat id equals the user id, so it works even if recipient.json holds someone else.
        $sentMarker = Countdown::birthdaySentMarker($storage);
        $recipientId = AccessGuard::recipientId();
        if (Story::isBirthdayToday() && !is_file($sentMarker) && $recipientId !== '') {
            $ownerId = trim((string) ($_ENV['OWNER_TELEGRAM_USER_ID'] ?? ''));
            try {
                $bot->sendMessage($recipientId, Countdown::birthdayMessage(), Countdown::birthdayKeyboard());
                file_put_contents($sentMarker, json_encode([
                    'sent_at' => date(DATE_ATOM),
                    'chat_id' => $recipientId,
                    'by' => 'bot',
                ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), LOCK_EX);
                @chmod($sentMarker, 0600);
                printf("[%s] Birthday notification sent.\n", date(DATE_ATOM));
                if ($ownerId !== '') {
                    $bot->sendMessage($ownerId, '✅ Уведомление ей отправлено в ' . date('H:i:s') . '.');
                }
            } catch (Throwable $e) {
                fwrite(STDERR, '[' . date(DATE_ATOM) . '] Birthday notification: ' . $e->getMessage() . PHP_EOL);
                if ($ownerId !== '' && !is_file($sentMarker . '.warned')) {
                    @file_put_contents($sentMarker . '.warned', date(DATE_ATOM));
                    try {
                        $bot->sendMessage($ownerId, '⚠️ Не удалось отправить ей уведомление: ' . $e->getMessage() . "\nСкорее всего, она ещё ни разу не нажимала /start в боте.");
                    } catch (Throwable) {
                    }
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
