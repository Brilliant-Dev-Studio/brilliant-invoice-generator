export type PwaPlatform = "android" | "ios" | "desktop" | "unknown";

export function detectPwaPlatform(): PwaPlatform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Macintosh|Windows|Linux/i.test(ua)) return "desktop";
  return "unknown";
}

export function isAndroidChrome(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /android/i.test(ua) && /Chrome/i.test(ua) && !/EdgA|OPR|SamsungBrowser/i.test(ua);
}

export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /FBAN|FBAV|Instagram|Line\/|TikTok|Twitter/i.test(ua);
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

/** Open this page in Chrome on Android (helps TikTok / Facebook in-app browsers). */
export function openCurrentPageInChrome(): void {
  const { href } = window.location;
  const withoutScheme = href.replace(/^https?:\/\//, "");
  const fallback = encodeURIComponent(href);
  window.location.href = `intent://${withoutScheme}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${fallback};end`;
}

export function scrollToDownloadSection(focusInstall = false): void {
  const section = document.getElementById("download-app");
  section?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (focusInstall) {
    window.setTimeout(() => {
      document.getElementById("pwa-install-primary")?.focus();
    }, 400);
  }
}
