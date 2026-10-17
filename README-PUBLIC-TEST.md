# Happy Day My Love — public test setup

This package is a test-ready configuration for the existing PHP Telegram bot and public GitHub Pages Mini App.

## What is included
- Existing bot entry point and relevant classes.
- `.env.example` with `MINI_APP_URL` already set to the public site.
- `.gitignore` rules to avoid committing tokens, storage state, vendor dependencies, and macOS `.DS_Store` files.

## Run it locally
Requirements: PHP 8.4+, Composer, PHP extensions `curl` and `json`.

1. Copy/merge these files into the root of your existing project.
2. Install dependencies if needed: `composer install`
3. Create your local environment file: `cp .env.example .env`
4. Put your Telegram BotFather token in `.env` as `TELEGRAM_BOT_TOKEN=...`
5. To test with an open bot, leave `ALLOWED_TELEGRAM_USER_ID=` empty. This allows any Telegram user to interact, so use only for a short test and don't use it for a private gift.
6. Start the long-polling bot: `php bin/bot.php`
7. Open https://t.me/happy_day_my_love_bot and send `/start`.

The bot countdown keyboard should include the `✨ Открыть романтический подарок` Web App button because `MINI_APP_URL` is configured. This URL opens the public static site:
https://nikolaimv77.github.io/happy.github.io/

## Important
- This does not deploy a running bot process. A PHP process must run on your Mac or an always-on server for the bot to answer.
- GitHub Pages hosts the static Mini App only; it does not execute PHP.
- Never commit `.env`. If a real bot token was previously committed publicly, revoke it with @BotFather and create a new one.
- For production, set `ALLOWED_TELEGRAM_USER_ID` to the intended recipient's numeric Telegram user ID.
