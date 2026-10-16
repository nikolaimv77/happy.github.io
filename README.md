# Happy Day My Love ❤️

Персональный Telegram-бот с обратным отсчётом и интерактивной историей-поздравлением. PHP 8.4+, Composer, Telegram Bot API.

## 1. Требования

- PHP 8.4+ с расширениями `curl` и `json`
- Composer
- токен бота от [@BotFather](https://t.me/BotFather)
- для автоматической отправки в день рождения — постоянно работающий компьютер или сервер

## 2. Установка на macOS

```bash
cd /путь/к/happy-day-my-love
cp .env.example .env
composer install
```

Открой `.env` и укажи `TELEGRAM_BOT_TOKEN`. Никогда не присылай токен в чат и не коммить `.env` в Git.

Перед реальным запуском заполни `ALLOWED_TELEGRAM_USER_ID` числовым Telegram user ID жены. Пока значение пустое, бот работает в режиме разработки и разрешает входящие чаты. Не оставляй его пустым в production.

## 3. Запуск бота

```bash
php bin/bot.php
```

Затем открой [@happy_day_my_love_bot](https://t.me/happy_day_my_love_bot) и нажми **Start**. Для автоматического поздравления жена должна заранее открыть бота и нажать Start хотя бы один раз.

Команды:

- `/start` — открыть бота; в день рождения открыть или продолжить историю
- `/countdown` — показать обратный отсчёт до 30 октября, 00:00
- `/story` — повторно показать текущую главу в день рождения
- `/restart` — начать историю заново в день рождения
- `/test` — проверить, что бот отвечает
- `/help` — показать список команд

Если команда `/start` или `/countdown` не отображается в меню Telegram, настрой команды через @BotFather → `/setcommands`:

```text
start - Открыть мой подарок ❤️
countdown - Обратный отсчёт до праздника
story - Продолжить историю
restart - Начать историю заново
test - Проверить бота
help - Помощь
```

Удали пробел перед `test`, если вставляешь список вручную: правильная строка — `test - Проверить бота`.

## 4. Обратный отсчёт

По умолчанию целевая дата — 30 октября, 00:00, часовой пояс `Asia/Tashkent`. Параметры задаются в `.env`:

```dotenv
APP_TIMEZONE=Asia/Tashkent
BIRTHDAY_MONTH=10
BIRTHDAY_DAY=30
BIRTHDAY_HOUR=0
BIRTHDAY_MINUTE=0
```

Пока `php bin/bot.php` работает, сохранённое сообщение отсчёта обновляется примерно раз в минуту. Telegram не поддерживает непрерывно анимируемый таймер в обычном сообщении, поэтому бот редактирует одно сообщение, а не отправляет новые.

## 5. Сценарий истории

История включает пролог, три главы и финальное письмо. Кнопки переходят между главами, а текущая глава сохраняется в `storage/story-progress.json`. Команда `/restart` сбрасывает историю на пролог.

Состояние хранится в JSON-файлах в `storage/`. Они закрыты от Git через `.gitignore`; не размещай `storage/` внутри публичного web-root.

## 6. Проверка отправки поздравления

По умолчанию команда работает в безопасном dry-run режиме и ничего не отправляет:

```bash
php bin/send-birthday.php
```

Перед запуском dry-run покажет текст, который был бы отправлен. Для реальной отправки в день рождения нужно намеренно выставить в `.env`:

```dotenv
ENABLE_REAL_BIRTHDAY_SEND=1
```

Реальная отправка разрешена только в настроенную дату. Скрипт создаёт маркер `storage/birthday-sent-ГОД.json`, чтобы последующие запуски в том же году не отправили повторное поздравление. Перед первым production-запуском обязательно протестируй всё с `ENABLE_REAL_BIRTHDAY_SEND=0`.

## 7. Планировщик на 30 октября

Пример для сервера, где системный часовой пояс установлен в `Asia/Tashkent` (проверь его перед использованием):

```cron
0 0 30 10 * cd /ABSOLUTE/PATH/happy-day-my-love && /ABSOLUTE/PATH/TO/php bin/send-birthday.php >> storage/birthday.log 2>&1
```

Проверь путь к PHP командой `which php`. Если компьютер может уснуть или выключиться, не используй его как production-сервер. Для надёжной отправки разверни приложение на постоянно работающем сервере.

## 8. Безопасность и ограничения

- Не отправляй токен бота никому и не сохраняй его в репозитории.
- Укажи `ALLOWED_TELEGRAM_USER_ID` до запуска для жены.
- Не оставляй бота в режиме разработки с пустым `ALLOWED_TELEGRAM_USER_ID`.
- `storage/` содержит Telegram ID и состояние истории; права на файлы ограничиваются по возможности до `0600`.
- Long polling (`php bin/bot.php`) и планировщик должны работать на сервере, который не засыпает.
- Для текущего персонального бота используется long polling; HTTPS webhook не требуется, пока бот работает в таком режиме.


## Midnight Romance countdown artwork

The bot sends `content/images/midnight-romance.png` before the countdown message when `/start` or `/countdown` is used. The image is decorative; the countdown text remains a separate message so it can be refreshed with Telegram's `editMessageText` API.


## Countdown milestones and birthday launch

The countdown changes its wording as the date approaches:

- more than 7 days: a short mysterious teaser;
- 7 days or fewer: a warmer message;
- 3 days or fewer: a more personal hint;
- 24 hours or fewer: the final teaser;
- on 30 October from 00:00 in `APP_TIMEZONE`: the birthday greeting replaces the countdown and offers **🎬 Начать нашу историю**.

The long-polling process (`php bin/bot.php`) refreshes the stored countdown message about once per minute. Keep it running on a machine/server that does not sleep. For a reliable scheduled greeting even if the polling process is restarted, configure the system scheduler to run `php /absolute/path/to/happy-day-my-love/bin/send-birthday.php` every minute. It is a dry run by default. Only after testing and setting `ENABLE_REAL_BIRTHDAY_SEND=1` will it publish a real greeting. It stores a year-specific marker to prevent duplicate sends.

Before production, set `ALLOWED_TELEGRAM_USER_ID` in `.env` to the recipient's numeric Telegram user ID. An empty value deliberately allows development access and is not appropriate for a real private gift. The recipient must open the bot and press `/start` once before Telegram can deliver a direct message.


## Telegram Mini App (Midnight Romance)

The romantic Mini App UI is served from `public/` and is designed for a narrow mobile viewport inside Telegram. It includes the animated countdown, a hint screen, three chapters, and the final letter.

1. Deploy the contents of `public/` behind a **public HTTPS** domain. `happy.loc` is a local development hostname and will not open on your wife's phone unless you expose it through a secure public HTTPS host.
2. Set `MINI_APP_URL=https://your-real-domain.example/` in `.env`. Do not include a token in this URL.
3. Restart `php bin/bot.php`; the countdown keyboard will include `✨ Открыть романтический подарок` as a Telegram Mini App button.
4. In BotFather, configure the bot's menu button if desired. The inline Mini App button in the bot message is already wired when `MINI_APP_URL` is a valid HTTPS URL.
5. Test on a phone in Telegram. The page can also be opened in a regular browser for visual development, but Telegram-specific behavior only works inside Telegram.

Security note: this first Mini App iteration is a static client-side story. It does not accept privileged actions or save sensitive information. If a future version adds private APIs or user-specific progress, validate Telegram `initData` on the PHP server; never trust user IDs supplied by JavaScript alone.
