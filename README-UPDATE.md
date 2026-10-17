# Happy Day My Love — Lilac & Gold animated redesign

This update keeps the existing Mini App structure and romantic content while shifting the palette decisively away from pink toward lilac, lavender, and violet with restrained gold accents. It includes animated lavender aurora background, floating sparkles, pulsing heart, rotating orbits, glowing title, shimmering CTA, and a lilac/gold envelope.

## Replace these files in the repository
- `public/index.html`
- `public/assets/css/style.css`
- `public/assets/js/app.js` (unchanged app logic, cache version updated in HTML)

Then commit and push to `main`; ensure the GitHub Actions Pages workflow completes successfully. The stylesheet URL is versioned `v=8` to invalidate the old browser cache.


## Preview mode (temporary)
- `PREVIEW_MODE = true` disables the birthday-date lock so all four chapters can be reviewed immediately.
- The main button label is `Открыть сюрприз`.
- The Back button returns to the previous chapter; from chapter one it returns to the countdown screen.
- CSS and JavaScript cache versions were bumped to `v=9`.
- After approval, set `PREVIEW_MODE = false` in `public/assets/js/app.js` to restore the date lock.
