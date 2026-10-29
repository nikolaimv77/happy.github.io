<?php

declare(strict_types=1);

namespace App;

use Throwable;

/**
 * Congratulations from other bot users to the birthday girl.
 *
 * Someone presses "💌 Поздравить", sends any message, and it is queued.
 * Before 30.10 00:00 the queue waits (so the surprise is not spoiled);
 * after the birthday notification it is delivered to her with a "from whom" header.
 * The author gets a copy of every greeting right away.
 */
final class Greetings
{
    private const AWAIT_SECONDS = 1800;
    private const DAILY_LIMIT = 5;

    public function __construct(private readonly string $storage)
    {
    }

    public function startAwaiting(int|string $userId): void
    {
        $state = $this->read('greet-state.json');
        $state[(string) $userId] = time();
        $this->write('greet-state.json', $state);
    }

    public function isAwaiting(int|string|null $userId): bool
    {
        if ($userId === null) {
            return false;
        }
        $state = $this->read('greet-state.json');
        return isset($state[(string) $userId]) && time() - (int) $state[(string) $userId] < self::AWAIT_SECONDS;
    }

    public function stopAwaiting(int|string $userId): void
    {
        $state = $this->read('greet-state.json');
        unset($state[(string) $userId]);
        $this->write('greet-state.json', $state);
    }

    public function limitReached(int|string $userId): bool
    {
        $since = time() - 86400;
        $count = 0;
        foreach ($this->read('greetings.json') as $item) {
            if ((string) ($item['user_id'] ?? '') === (string) $userId && (int) ($item['at'] ?? 0) >= $since) {
                $count++;
            }
        }
        return $count >= self::DAILY_LIMIT;
    }

    public function queue(array $message): array
    {
        $from = $message['from'] ?? [];
        $name = trim(((string) ($from['first_name'] ?? '')) . ' ' . ((string) ($from['last_name'] ?? '')));
        $item = [
            'user_id' => $from['id'] ?? null,
            'name' => $name !== '' ? $name : 'Гость',
            'username' => (string) ($from['username'] ?? ''),
            'from_chat_id' => $message['chat']['id'] ?? null,
            'message_id' => (int) ($message['message_id'] ?? 0),
            'at' => time(),
            'delivered' => false,
        ];
        $all = $this->read('greetings.json');
        $all[] = $item;
        $this->write('greetings.json', $all);
        return $item;
    }

    public static function header(array $item): string
    {
        $who = $item['name'] . ($item['username'] !== '' ? ' (@' . $item['username'] . ')' : '');
        return "💌 Поздравление от {$who}";
    }

    /** Delivers queued greetings to her. Returns how many were delivered. */
    public function deliverPending(TelegramBot $bot, string $recipientId): int
    {
        $all = $this->read('greetings.json');
        $delivered = 0;
        foreach ($all as $i => $item) {
            if (!empty($item['delivered']) || empty($item['from_chat_id']) || empty($item['message_id'])) {
                continue;
            }
            try {
                $bot->sendMessage($recipientId, self::header($item));
                $bot->copyMessage($recipientId, $item['from_chat_id'], (int) $item['message_id']);
                $all[$i]['delivered'] = true;
                $all[$i]['delivered_at'] = time();
                $delivered++;
            } catch (Throwable $e) {
                // The sender may have deleted the message; do not retry it forever.
                if (str_contains($e->getMessage(), 'message to copy not found')) {
                    $all[$i]['delivered'] = true;
                    $all[$i]['error'] = $e->getMessage();
                } else {
                    fwrite(STDERR, '[' . date(DATE_ATOM) . '] Greeting delivery: ' . $e->getMessage() . PHP_EOL);
                    break;
                }
            }
        }
        if ($delivered > 0 || $all !== $this->read('greetings.json')) {
            $this->write('greetings.json', $all);
        }
        return $delivered;
    }

    private function read(string $name): array
    {
        $file = $this->storage . '/' . $name;
        if (!is_file($file)) {
            return [];
        }
        $data = json_decode((string) file_get_contents($file), true);
        return is_array($data) ? $data : [];
    }

    private function write(string $name, array $data): void
    {
        $file = $this->storage . '/' . $name;
        file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), LOCK_EX);
        @chmod($file, 0600);
    }
}
