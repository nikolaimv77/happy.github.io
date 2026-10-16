<?php

declare(strict_types=1);

namespace App;

use RuntimeException;

final class StoryProgress
{
    public function __construct(private readonly string $file)
    {
    }

    public function get(int|string $chatId): string
    {
        $all = $this->read();
        $state = $all[(string) $chatId]['chapter'] ?? Story::PROLOGUE;
        return is_string($state) ? $state : Story::PROLOGUE;
    }

    public function set(int|string $chatId, string $chapter): void
    {
        $all = $this->read();
        $all[(string) $chatId] = [
            'chapter' => $chapter,
            'updated_at' => date(DATE_ATOM),
        ];
        $this->write($all);
    }

    public function reset(int|string $chatId): void
    {
        $this->set($chatId, Story::PROLOGUE);
    }

    private function read(): array
    {
        if (!is_file($this->file)) {
            return [];
        }
        $raw = file_get_contents($this->file);
        if ($raw === false || trim($raw) === '') {
            return [];
        }
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            throw new RuntimeException('Story progress file is not valid JSON.');
        }
        return $data;
    }

    private function write(array $data): void
    {
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        if (file_put_contents($this->file, $json, LOCK_EX) === false) {
            throw new RuntimeException('Unable to write story progress file.');
        }
        @chmod($this->file, 0600);
    }
}
