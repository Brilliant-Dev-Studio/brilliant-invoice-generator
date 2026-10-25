# San Pya Android app (APK + WebView)

Clients get a **real Android app** (APK install). Inside the app, a **WebView** opens your live San Pya site (same login, invoices, PDF as the browser).

This is **not** a Play Store download unless you publish it later. The landing page **Download APK** button serves the file from `/downloads/san-pya.apk` or `NEXT_PUBLIC_ANDROID_APK_URL`.

## How it works

| Layer | What |
|--------|------|
| Native shell | Capacitor Android project in `android/` |
| UI & data | `CAPACITOR_SERVER_URL` (default: production Vercel URL) |
| Updates | Change the website — app users get updates on next open (no APK reinstall for most changes) |
| APK version | Bump `package.json` `version` when you ship a new **native** build |

## Build debug APK (for testing)

Requirements: Node 24+, Android Studio (SDK), JDK 17+.

```bash
npm install
npm run cap:sync
npm run android:apk:debug
```

Copy the APK:

```bash
cp android/app/build/outputs/apk/debug/app-debug.apk public/downloads/san-pya.apk
```

Deploy so clients can download from the landing page.

## Release / Play Store (later)

1. Create a signing keystore (keep it secret).
2. Configure signing in `android/app/build.gradle`.
3. `npm run android:apk:release` (after adding the release script).
4. Upload AAB to Google Play **or** host the signed APK at `NEXT_PUBLIC_ANDROID_APK_URL`.

## Environment

| Variable | Purpose |
|----------|---------|
| `CAPACITOR_SERVER_URL` | URL loaded inside the app (default: production site) |
| `NEXT_PUBLIC_ANDROID_APK_URL` | Optional override for APK download link on landing |

## PWA vs APK

- **APK** — best for “real app” install; use **Download APK** on landing.
- **PWA** — optional; Chrome “Add to Home screen” without APK file.
