# Happy Day My Love — design and music update

## What changed

- Updated the full-screen reference poster to the latest version with the text **«До твоего дня рождения осталось»**. The poster is used as a single artwork image so its lettering, composition, portrait, flowers and gold frame remain visually faithful to the reference.
- Added a discreet glass-style music toggle in the bottom-right corner. Music does not autoplay; the visitor starts/stops it explicitly, which is required by mobile browsers and Telegram Mini Apps.
- Added an original synthesized soft romantic instrumental loop at `public/assets/audio/romantic-piano.wav` (no third-party recording).
- Added the Great Vibes script font for interactive chapter headings, while keeping Cormorant Garamond for the romantic serif typography.
- Improved translucent glass styling and gold glow on interactive countdown cards.
- Updated cache versions to `v=11` so GitHub Pages clients fetch the latest CSS and JavaScript.

## Publish

Copy the contents of `public/` into the `public/` directory of the GitHub Pages repository, then run:

```bash
git add public
git commit -m "Match birthday reference and add romantic music"
git push origin main
```

Wait for the GitHub Actions workflow to finish, then hard-refresh the page. GitHub Pages serves static files only; the PHP Telegram bot must run separately on a PHP-capable host or local machine.

## Music behavior

Tap the small `♫` control to play or pause the instrumental. Playback is intentionally user-initiated and loops until paused. The volume is set conservatively to 32% in `public/assets/js/app.js`.

## Security note

Do not put `.env` in an archive or commit it to Git. Keep the actual Telegram bot token only in the local/server environment. If a real token was included in an uploaded archive, revoke it with BotFather and issue a replacement.
