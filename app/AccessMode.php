<?php

declare(strict_types=1);

namespace App;

use RuntimeException;

/**
 * "Open for everyone" switch controlled by the author from the bot.
 *
 * The bot keeps its own copy in storage/access.json; the site reads
 * public/assets/access.json from GitHub Pages, which the bot updates through
 * the GitHub contents API (token in GITHUB_TOKEN, contents:write on this repo).
 */
final class AccessMode
{
    private const SITE_PATH = 'public/assets/access.json';

    public static function isOpenForAll(string $storage): bool
    {
        $file = $storage . '/access.json';
        if (!is_file($file)) {
            return false;
        }
        $data = json_decode((string) file_get_contents($file), true);
        return is_array($data) && !empty($data['openForAll']);
    }

    /** Saves the switch locally and publishes it to the site. Returns a human-readable status. */
    public static function set(string $storage, bool $openForAll): string
    {
        $payload = json_encode([
            'openForAll' => $openForAll,
            'updatedAt' => date(DATE_ATOM),
        ], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR) . "\n";
        file_put_contents($storage . '/access.json', $payload, LOCK_EX);
        @chmod($storage . '/access.json', 0600);

        try {
            self::publish($payload, $openForAll);
            return 'Сайт обновится через 1–2 минуты.';
        } catch (RuntimeException $e) {
            return 'В боте режим включён, но на сайт не отправлен: ' . $e->getMessage();
        }
    }

    private static function publish(string $payload, bool $openForAll): void
    {
        $token = (string) ($_ENV['GITHUB_TOKEN'] ?? '') ?: (string) getenv('GITHUB_TOKEN');
        $repo = trim((string) ($_ENV['GITHUB_REPO'] ?? 'nikolaimv77/happy.github.io'));
        $branch = trim((string) ($_ENV['GITHUB_BRANCH'] ?? 'main'));
        if ($token === '') {
            throw new RuntimeException('нет GITHUB_TOKEN (сохраните его в Связку ключей как happy-github-token).');
        }

        $url = "https://api.github.com/repos/{$repo}/contents/" . self::SITE_PATH;
        $current = self::request('GET', $url . '?ref=' . rawurlencode($branch), $token);
        $body = [
            'message' => $openForAll ? 'Сюрприз открыт для всех' : 'Сюрприз только для получателя',
            'content' => base64_encode($payload),
            'branch' => $branch,
        ];
        if (!empty($current['sha'])) {
            $body['sha'] = $current['sha'];
        }
        self::request('PUT', $url, $token, $body);
    }

    private static function request(string $method, string $url, string $token, ?array $body = null): array
    {
        $curl = curl_init($url);
        $headers = [
            'Accept: application/vnd.github+json',
            'Authorization: Bearer ' . $token,
            'User-Agent: happy-day-my-love-bot',
            'X-GitHub-Api-Version: 2022-11-28',
        ];
        $options = [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 20,
        ];
        if ($body !== null) {
            $options[CURLOPT_POSTFIELDS] = json_encode($body, JSON_THROW_ON_ERROR);
            $headers[] = 'Content-Type: application/json';
            $options[CURLOPT_HTTPHEADER] = $headers;
        }
        curl_setopt_array($curl, $options);
        $response = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $error = curl_error($curl);

        if ($response === false) {
            throw new RuntimeException('GitHub недоступен: ' . $error);
        }
        $data = json_decode((string) $response, true);
        // 404 on GET just means the file does not exist yet.
        if ($method === 'GET' && $status === 404) {
            return [];
        }
        if ($status < 200 || $status >= 300) {
            throw new RuntimeException('GitHub ответил ' . $status . ': ' . (is_array($data) ? (string) ($data['message'] ?? '') : ''));
        }
        return is_array($data) ? $data : [];
    }
}
