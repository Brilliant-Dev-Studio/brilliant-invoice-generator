"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { translate, type LandingLocale } from "@/lib/landing-language";
import { useLanguage } from "./language-provider";

type Theme = "light" | "dark";
const InitialThemeContext = createContext<Theme>("light");
const subscribe = () => () => {};
function ThemeCookieSync() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    document.cookie = `brilliant_theme=${resolvedTheme}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  }, [resolvedTheme]);
  return null;
}

export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: Theme;
  children: React.ReactNode;
}) {
  return (
    <InitialThemeContext.Provider value={initialTheme}>
      <NextThemesProvider
        attribute="data-theme"
        storageKey="san-pya-theme"
        defaultTheme={initialTheme}
        enableSystem={false}
      >
        <ThemeCookieSync />
        {children}
      </NextThemesProvider>
    </InitialThemeContext.Provider>
  );
}

export function ThemeToggle({ locale }: { locale?: LandingLocale }) {
  const currentLocale = useLanguage();
  const initialTheme = useContext(InitialThemeContext);
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const theme = mounted ? (resolvedTheme ?? initialTheme) : initialTheme;
  const label = translate(
    locale ?? currentLocale,
    `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
  );
  function switchTheme() {
    const root = document.documentElement;
    if (root.classList.contains("theme-switching")) return;
    const next = theme === "dark" ? "light" : "dark";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTheme(next);
      return;
    }
    root.classList.add("theme-switching");
    if (document.startViewTransition) {
      try {
        const transition = document.startViewTransition(() => {
          flushSync(() => setTheme(next));
        });
        void transition.finished
          .catch(() => {})
          .finally(() => {
            root.classList.remove("theme-switching");
          });
      } catch {
        setTheme(next);
        root.classList.remove("theme-switching");
      }
    } else {
      root.classList.add("theme-color-fade");
      setTheme(next);
      window.setTimeout(() => {
        root.classList.remove("theme-switching", "theme-color-fade");
      }, 550);
    }
  }
  return (
    <button
      type="button"
      className="icon-button theme-toggle no-print"
      onClick={switchTheme}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
