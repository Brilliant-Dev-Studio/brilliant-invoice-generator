"use client";

import { useEffect } from "react";
import { initPwaInstallStore } from "@/lib/pwa-install-store";
import { ensureServiceWorkerReady } from "@/lib/pwa-install-flow";

export function PwaRegister() {
  useEffect(() => {
    initPwaInstallStore();
    void ensureServiceWorkerReady();
  }, []);
  return null;
}
