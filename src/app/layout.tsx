import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { NavigationProgress } from "@/components/navigation-progress";
import { PwaRegister } from "@/components/pwa-register";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme-provider";
import { ValidationToasts } from "@/components/validation-toasts";
import { LanguageProvider } from "@/components/language-provider";
import { LANGUAGE_COOKIE, landingLocale } from "@/lib/landing-language";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource-variable/bricolage-grotesque";
import "./globals.css";
import "./workspace.css";
import "./client-responsive.css";
import "./language.css";
import "./night.css";
import "./daylight.css";
import "./theme-transition.css";
import "./brand.css";
import "./mobile-dock.css";
const myanmarFont = localFont({
  src: [
    {
      path: "./fonts/myanmar/noto-sans-myanmar-400.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/myanmar/noto-sans-myanmar-500.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/myanmar/noto-sans-myanmar-600.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/myanmar/noto-sans-myanmar-700.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-myanmar",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#a45138" },
    { media: "(prefers-color-scheme: dark)", color: "#1b2635" },
  ],
};
export const metadata: Metadata = {
  title: {
    default: "San Pya Invoice | Invoice workspace",
    template: "%s | San Pya Invoice",
  },
  description: "A thoughtful invoice workspace for your business.",
  applicationName: "San Pya Invoice",
  appleWebApp: {
    capable: true,
    title: "စံပြ",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme =
    (await cookies()).get("brilliant_theme")?.value === "dark"
      ? "dark"
      : "light";
  const locale = landingLocale((await cookies()).get(LANGUAGE_COOKIE)?.value);
  return (
    <html
      lang={locale}
      data-theme={theme}
      className={myanmarFont.variable}
      suppressHydrationWarning
    >
      <body>
        <div className="daylight-atmosphere" aria-hidden="true">
          <i className="daylight-moon" />
          <i className="daylight-shooting-star" />
          <i className="daylight-shooting-star" />
          <i className="daylight-shooting-star" />
        </div>
        <div className="night-atmosphere" aria-hidden="true">
          <i className="night-shooting-star" />
          <i className="night-shooting-star" />
          <i className="night-shooting-star" />
        </div>
        <LanguageProvider locale={locale}>
          <ThemeProvider initialTheme={theme}>
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            <PwaRegister />
            {children}
          </ThemeProvider>
          <ValidationToasts />
        </LanguageProvider>
      </body>
    </html>
  );
}
