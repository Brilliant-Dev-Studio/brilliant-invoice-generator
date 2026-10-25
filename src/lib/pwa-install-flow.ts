"use client";

import {
  detectPwaPlatform,
  isAndroidInstallBrowser,
  isInAppBrowser,
  isStandaloneDisplay,
  openCurrentPageInChrome,
} from "@/lib/pwa-client";
import {
  getDeferredInstallPrompt,
  promptPwaInstall,
  setPwaInstalled,
  waitForDeferredPrompt,
} from "@/lib/pwa-install-store";

const SW_RELOAD_KEY = "pwa-install-sw-reload";

export type PwaInstallAttemptResult =
  | { status: "accepted" }
  | { status: "dismissed" }
  | { status: "already-installed" }
  | { status: "opened-chrome" }
  | { status: "reloading" }
  | { status: "needs-help"; reason: "ios" | "android" | "desktop" };

export async function ensureServiceWorkerReady(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;

  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
  } catch {
    return false;
  }

  if (navigator.serviceWorker.controller) return true;

  await new Promise<void>((resolve) => {
    const timeout = window.setTimeout(resolve, 6000);
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => {
        window.clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });

  return Boolean(navigator.serviceWorker.controller);
}

/** One gentle reload after SW activates so Chrome can offer install. */
export function reloadOnceForPwaInstall(): boolean {
  if (sessionStorage.getItem(SW_RELOAD_KEY)) return false;
  sessionStorage.setItem(SW_RELOAD_KEY, "1");
  const hash = window.location.hash || "#download-app";
  window.location.href = `${window.location.pathname}${window.location.search}${hash}`;
  window.location.reload();
  return true;
}

export async function attemptPwaInstall(): Promise<PwaInstallAttemptResult> {
  if (isStandaloneDisplay()) {
    setPwaInstalled(true);
    return { status: "already-installed" };
  }

  const platform = detectPwaPlatform();

  if (platform === "android" && isInAppBrowser()) {
    openCurrentPageInChrome();
    return { status: "opened-chrome" };
  }

  await ensureServiceWorkerReady();

  if (getDeferredInstallPrompt()) {
    const outcome = await promptPwaInstall();
    if (outcome === "accepted") return { status: "accepted" };
    if (outcome === "dismissed") return { status: "dismissed" };
  }

  const gotPrompt = await waitForDeferredPrompt(3500);
  if (gotPrompt && getDeferredInstallPrompt()) {
    const outcome = await promptPwaInstall();
    if (outcome === "accepted") return { status: "accepted" };
    if (outcome === "dismissed") return { status: "dismissed" };
  }

  if (
    platform === "android" &&
    !navigator.serviceWorker.controller &&
    reloadOnceForPwaInstall()
  ) {
    return { status: "reloading" };
  }

  if (platform === "ios") {
    return { status: "needs-help", reason: "ios" };
  }

  if (platform === "android") {
    if (!isAndroidInstallBrowser()) {
      openCurrentPageInChrome();
      return { status: "opened-chrome" };
    }
    return { status: "needs-help", reason: "android" };
  }

  if (getDeferredInstallPrompt()) {
    const outcome = await promptPwaInstall();
    if (outcome === "accepted") return { status: "accepted" };
    if (outcome === "dismissed") return { status: "dismissed" };
  }

  return { status: "needs-help", reason: "desktop" };
}
