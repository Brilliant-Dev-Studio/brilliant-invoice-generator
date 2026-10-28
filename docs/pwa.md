# PWA (Android / iPhone — Add to Home screen)

San Pya Invoice can be installed as a lightweight app without the Play Store.

## What is included

- Web App Manifest (`src/app/manifest.ts` → `/manifest.webmanifest`)
- Icons in `public/icons/` (regenerate: `npm run pwa:icons`)
- Service worker `public/sw.js` (network-first; required for Chrome install)
- Theme color and Apple web app meta tags in `src/app/layout.tsx`

## Install on Android (Chrome)

1. Open **https://brilliant-invoice-generator.vercel.app** in **Chrome** (not TikTok/Facebook in-app browser).
2. On the homepage, tap **Install on Android** (or **Install now** when Chrome is ready).
3. If nothing happens on the first visit, tap **Refresh page to enable install**, then tap Install again.
4. Or Chrome menu (⋮) → **Install app** / **Add to Home screen**.
5. Open from the home screen icon — runs fullscreen like an app.

This is a **PWA** (web app), not an APK from Play Store.

## Install on iPhone (Safari)

1. Open the site in Safari.
2. Share → **Add to Home Screen**.
3. Name: **စံပြ** (or San Pya).

## App version

- Shown on the landing **Download app** section, in the dashboard footer, and under **Settings → About this app**.
- **Source of truth:** `version` in `package.json` (via `src/lib/app-version.ts`). Bump it when you ship a client-visible release, then deploy.

## Notes

- **Internet required** — invoices and auth use the live server (not offline-first).
- **PDF** — use **Save PDF** → **Share** → Files (same as mobile browser).
- **Gallery (PNG)** — use **Save to gallery** → **Save PNG to gallery** (share sheet → Photos on iPhone/Android).
- After changing icons, run `npm run pwa:icons` and redeploy.
- Service worker updates on redeploy; users may need to close and reopen the installed app once.

## Play Store later

This PWA can be wrapped with **Trusted Web Activity (TWA)** or **Capacitor** using the same production URL.
