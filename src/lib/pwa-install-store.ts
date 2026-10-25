"use client";

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Listener = () => void;

let deferredPrompt: InstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<Listener>();
let initialized = false;

function notify() {
  listeners.forEach((listener) => listener());
}

export function initPwaInstallStore() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as InstallPromptEvent;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    installed = true;
    deferredPrompt = null;
    notify();
  });
}

export function subscribePwaInstall(listener: Listener) {
  initPwaInstallStore();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDeferredInstallPrompt() {
  return deferredPrompt;
}

export function isPwaInstalled() {
  return installed;
}

export function setPwaInstalled(value: boolean) {
  installed = value;
  notify();
}

export async function promptPwaInstall(): Promise<
  "accepted" | "dismissed" | "unavailable"
> {
  const prompt = deferredPrompt;
  if (!prompt) return "unavailable";
  deferredPrompt = null;
  notify();
  await prompt.prompt();
  const { outcome } = await prompt.userChoice;
  if (outcome === "accepted") {
    installed = true;
    notify();
  }
  return outcome;
}

export function waitForDeferredPrompt(timeoutMs: number): Promise<boolean> {
  initPwaInstallStore();
  if (deferredPrompt) return Promise.resolve(true);

  return new Promise((resolve) => {
    const done = (value: boolean) => {
      clearTimeout(timer);
      listeners.delete(onChange);
      resolve(value);
    };
    const onChange = () => {
      if (deferredPrompt) done(true);
    };
    const timer = window.setTimeout(() => done(false), timeoutMs);
    listeners.add(onChange);
  });
}
