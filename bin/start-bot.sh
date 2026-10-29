#!/bin/zsh
# Запускает бота, беря TELEGRAM_BOT_TOKEN из Связки ключей macOS (там он хранится зашифрованным),
# и не даёт Mac уснуть, пока бот работает — чтобы уведомление ушло ровно в 00:00.
#
# Один раз сохранить токен в Связку ключей (macOS спросит сам токен):
#   security add-generic-password -a "$USER" -s happy-bot-token -w
# Заменить токен на новый:
#   security add-generic-password -U -a "$USER" -s happy-bot-token -w
set -euo pipefail
cd "${0:A:h}/.."

if ! TELEGRAM_BOT_TOKEN="$(security find-generic-password -a "$USER" -s happy-bot-token -w 2>/dev/null)"; then
  echo "Токен не найден в Связке ключей. Сохраните его командой:"
  echo '  security add-generic-password -a "$USER" -s happy-bot-token -w'
  exit 1
fi
export TELEGRAM_BOT_TOKEN

# Необязательно: токен GitHub (contents:write на этот репозиторий) — чтобы кнопка
# «Открыть сюрприз для всех» в боте обновляла и сайт. Сохранить:
#   security add-generic-password -a "$USER" -s happy-github-token -w
if GITHUB_TOKEN="$(security find-generic-password -a "$USER" -s happy-github-token -w 2>/dev/null)"; then
  export GITHUB_TOKEN
fi

exec caffeinate -i php bin/bot.php
