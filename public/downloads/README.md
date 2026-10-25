# Android APK hosting

Place the signed or debug APK here as **`san-pya.apk`** (or set `NEXT_PUBLIC_ANDROID_APK_URL` to another HTTPS URL).

Build the native shell (loads your live site in a WebView):

```bash
npm install
npm run cap:sync
npm run android:apk:debug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk` — copy/rename to `san-pya.apk` for the landing page download link.

See `docs/android-apk.md` for Play Store and signing.
