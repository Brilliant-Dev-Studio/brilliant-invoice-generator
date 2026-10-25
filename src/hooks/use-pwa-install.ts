"use client";

import { useCallback, useEffect, useState } from "react";
import {
  detectPwaPlatform,
  isAndroidChrome,
  isInAppBrowser,
  isStandaloneDisplay,
  openCurrentPageInChrome,
  type PwaPlatform,
} from "@/lib/pwa-client";

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function usePwaInstall() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null,
  );
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<PwaPlatform>("unknown");

  useEffect(() => {
    setPlatform(detectPwaPlatform());
    if (isStandaloneDisplay()) {
      setInstalled(true);
    }

    const onInstallable = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onInstallable);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallable);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    if (!installPrompt) return "unavailable";
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    setInstallPrompt(null);
    if (outcome === "accepted") {
      setInstalled(true);
    }
    return outcome;
  }, [installPrompt]);

  const prepareAndroidInstall = useCallback((): "prompt" | "chrome" | "help" => {
    if (installPrompt) return "prompt";
    if (platform === "android" && (isInAppBrowser() || !isAndroidChrome())) {
      openCurrentPageInChrome();
      return "chrome";
    }
    return "help";
  }, [installPrompt, platform]);

  return {
    platform,
    installed,
    canOneClickInstall: Boolean(installPrompt) && !installed,
    install,
    prepareAndroidInstall,
  };
}
