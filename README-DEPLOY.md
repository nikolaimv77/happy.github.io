# Happy Day My Love — GitHub Pages fix

Merge the `public/` and `.github/` folders from this package into the root of your local repository:
`/Users/mac/Sites/happy.github.io`

This package contains a static `public/index.html` generated from the original `public/index.php`. GitHub Pages does not execute PHP.

The workflow stages only `public/index.html` and `public/assets/` into `_site` and deploys that artifact. It does not publish PHP source files or other repository files.

## GitHub settings
Repository: `nikolaimv77/happy.github.io`
Settings → Pages → Build and deployment → Source: **GitHub Actions**

## Commit and push
From the repository root:

    git add .github/workflows/jekyll-gh-pages.yml public/index.html public/assets
    git commit -m "Fix GitHub Pages static deployment"
    git push origin main

If Git says there are no changes, run `git status`. If push fails with an authentication error, fix GitHub authentication (SSH or a Personal Access Token) first.

Then open Actions and confirm `Deploy Happy Day My Love` succeeds.

Published URL: https://nikolaimv77.github.io/happy.github.io/

Do not publish `.env`, real bot tokens, `vendor/`, or private data. If a real Telegram bot token was ever committed to a public repository, revoke it through BotFather.
