# Personal website

Peter Wang's personal site. Static HTML for now; open `index.html` in a browser.

Live at https://pwang19.github.io/. Status: clickable mockup (home + lab notebook). Placeholder content is marked as such.

## Tests

Playwright + TypeScript, run on Chromium, WebKit and a mobile (Pixel 5) viewport.

```sh
npm ci
npx playwright install chromium webkit
npm run typecheck
npm test            # starts a local server on :4173 automatically
```

Covers page content, pipeline expand/collapse (mouse and keyboard), hash navigation,
the heat slider, theme persistence, horizontal-overflow on mobile, and axe WCAG A/AA
scans in light and dark mode. CI (`.github/workflows/playwright.yml`) runs on push, PRs
and nightly.
