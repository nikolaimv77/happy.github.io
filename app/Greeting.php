<?php

declare(strict_types=1);

namespace App;

final class Greeting
{
    public static function start(): string
    {
        return "Привет, мое солнышко! ❤️\n\n"
            . "Я приготовил для тебя кое-что особенное ко дню рождения. "
            . "Здесь будет маленький подарок, созданный только для тебя.\n\n"
            . "Нажми на кнопку ниже, когда будешь готова. 🌹";
    }

    public static function birthday(): string
    {
        return "С днем рождения, мое солнышко! ❤️🎂\n\n"
            . "Желаю тебе здоровья, душевного спокойствия, радости и исполнения желаний. "
            . "Пусть в каждом дне будет что-то хорошее, а впереди нас ждет еще много теплых "
            . "и счастливых моментов вместе.\n\n"
            . "Я рад, что ты есть в моей жизни. Обнимаю крепко. ❤️";
    }

    public static function keyboard(string $giftUrl): array
    {
        if ($giftUrl !== '' && filter_var($giftUrl, FILTER_VALIDATE_URL)) {
            return [
                'inline_keyboard' => [[
                    ['text' => 'Открыть мой подарок ❤️', 'url' => $giftUrl],
                ]],
            ];
        }

        return [
            'inline_keyboard' => [[
                ['text' => 'Подарок скоро появится ❤️', 'callback_data' => 'gift_coming'],
            ]],
        ];
    }
}
