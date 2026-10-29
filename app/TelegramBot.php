<?php

declare(strict_types=1);

namespace App;

use RuntimeException;

final class TelegramBot
{
    public function __construct(private readonly string $token)
    {
        if ($token === '') {
            throw new RuntimeException('TELEGRAM_BOT_TOKEN is missing. Check your .env file.');
        }
    }

    public function getMe(): array
    {
        return $this->request('getMe');
    }

    public function getUpdates(int $offset, int $timeout = 25): array
    {
        return $this->request('getUpdates', [
            'offset' => $offset,
            'timeout' => $timeout,
            'allowed_updates' => json_encode(['message', 'callback_query'], JSON_THROW_ON_ERROR),
        ], $timeout + 10);
    }

    public function sendPhoto(int|string $chatId, string $photoPath, string $caption = ''): array
    {
        if (!is_file($photoPath) || !is_readable($photoPath)) {
            throw new RuntimeException('Countdown image is missing or unreadable: ' . $photoPath);
        }

        $url = "https://api.telegram.org/bot{$this->token}/sendPhoto";
        $curl = curl_init($url);
        $data = [
            'chat_id' => $chatId,
            'photo' => new \CURLFile($photoPath),
        ];
        if ($caption !== '') {
            $data['caption'] = $caption;
        }

        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $data,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);

        $response = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $error = curl_error($curl);

        if ($response === false) {
            throw new RuntimeException("Telegram photo upload failed: {$error}");
        }

        $decoded = json_decode($response, true);
        if ($status < 200 || $status >= 300 || !is_array($decoded) || !($decoded['ok'] ?? false)) {
            $description = is_array($decoded) ? ($decoded['description'] ?? 'Unknown API error') : 'Invalid API response';
            throw new RuntimeException("Telegram API error ({$status}): {$description}");
        }

        // Some methods (answerCallbackQuery, deleteMessage…) return plain `true` instead of an object.
        $result = $decoded['result'] ?? [];
        return is_array($result) ? $result : ['ok' => $result];
    }

    public function sendMessage(int|string $chatId, string $text, ?array $replyMarkup = null): array
    {
        $data = [
            'chat_id' => $chatId,
            'text' => $text,
        ];

        if ($replyMarkup !== null) {
            $data['reply_markup'] = json_encode($replyMarkup, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        }

        return $this->request('sendMessage', $data);
    }

    /** Copies any message (text, photo, video, voice, sticker…) without the "Forwarded from" header. */
    public function copyMessage(int|string $chatId, int|string $fromChatId, int $messageId): array
    {
        return $this->request('copyMessage', [
            'chat_id' => $chatId,
            'from_chat_id' => $fromChatId,
            'message_id' => $messageId,
        ]);
    }

    public function editMessageText(int|string $chatId, int $messageId, string $text, ?array $replyMarkup = null): array
    {
        $data = [
            'chat_id' => $chatId,
            'message_id' => $messageId,
            'text' => $text,
        ];

        if ($replyMarkup !== null) {
            $data['reply_markup'] = json_encode($replyMarkup, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        }

        return $this->request('editMessageText', $data);
    }

    public function answerCallbackQuery(string $callbackQueryId, string $text = ''): array
    {
        return $this->request('answerCallbackQuery', [
            'callback_query_id' => $callbackQueryId,
            'text' => $text,
        ]);
    }

    private function request(string $method, array $data = [], int $timeout = 20): array
    {
        $url = "https://api.telegram.org/bot{$this->token}/{$method}";
        $curl = curl_init($url);

        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($data),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);

        $response = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $error = curl_error($curl);

        if ($response === false) {
            throw new RuntimeException("Telegram connection failed: {$error}");
        }

        $decoded = json_decode($response, true);

        if ($status < 200 || $status >= 300 || !is_array($decoded) || !($decoded['ok'] ?? false)) {
            $description = is_array($decoded) ? ($decoded['description'] ?? 'Unknown API error') : 'Invalid API response';
            throw new RuntimeException("Telegram API error ({$status}): {$description}");
        }

        // Some methods (answerCallbackQuery, deleteMessage…) return plain `true` instead of an object.
        $result = $decoded['result'] ?? [];
        return is_array($result) ? $result : ['ok' => $result];
    }
}
