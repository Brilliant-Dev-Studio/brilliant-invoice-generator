/** Hosted APK for direct download (upload after `npm run android:apk:debug` or release build). */
export function getAndroidApkDownloadUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_ANDROID_APK_URL?.trim();
  if (fromEnv) return fromEnv;
  return "/downloads/san-pya.apk";
}

export const ANDROID_PACKAGE_ID = "com.sanpya.invoice";
