"use client";

import { useCallback, useEffect, useState } from "react";
import {
  detectPwaPlatform,
  isStandaloneDisplay,
  type PwaPlatform,
} from "@/lib/pwa-client";
import {
  getDeferredInstallPrompt,
  isPwaInstalled,
  promptPwaInstall,
  setPwaInstalled,
  subscribePwaInstall,
} from "@/lib/pwa-install-store";
import { attemptPwaInstall, ensureServiceWorkerReady } from "@/lib/pwa-install-flow";

export function usePwaInstall() {
  const [platform, setPlatform] = useState<PwaPlatform>("unknown");
  const [installed, setInstalled] = useState(false);
  const [canOneClickInstall, setCanOneClickInstall] = useState(false);

  const sync = useCallback(() => {
    setInstalled(isPwaInstalled() || isStandaloneDisplay());
    setCanOneClickInstall(Boolean(getDeferredInstallPrompt()) && !isPwaInstalled());
  }, []);

  useEffect(() => {
    setPlatform(detectPwaPlatform());
    if (isStandaloneDisplay()) {
      setPwaInstalled(true);
    }
    sync();
    void ensureServiceWorkerReady().then(() => sync());
    return subscribePwaInstall(sync);
  }, [sync]);

  const install = useCallback(async () => {
    const outcome = await promptPwaInstall();
    sync();
    return outcome;
  }, [sync]);

  const installWithFallback = useCallback(async () => {
    const result = await attemptPwaInstall();
    sync();
    return result;
  }, [sync]);

  return {
    platform,
    installed,
    canOneClickInstall,
    install,
    installWithFallback,
  };
}
