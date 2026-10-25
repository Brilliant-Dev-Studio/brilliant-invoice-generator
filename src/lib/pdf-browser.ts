import { randomUUID } from "node:crypto";
import type { Browser } from "playwright-core";

export type PdfBrowserSession = {
  browser: Browser;
  userDataDir?: string;
};

/** Launch Chromium for invoice PDF export (Vercel serverless vs local dev). */
export async function launchPdfBrowser(): Promise<PdfBrowserSession> {
  const onVercel = process.env.VERCEL === "1";
  const customExecutable = onVercel
    ? undefined
    : process.env.CHROMIUM_EXECUTABLE_PATH?.trim() || undefined;

  if (onVercel && !customExecutable) {
    const serverless = (await import("@sparticuz/chromium")).default;
    serverless.setGraphicsMode = false;
    const { chromium } = await import("playwright-core");
    const userDataDir = `/tmp/pw-${randomUUID()}`;
    const browser = await chromium.launch({
      headless: true,
      args: [...serverless.args, `--user-data-dir=${userDataDir}`],
      executablePath: await serverless.executablePath(),
    });
    return { browser, userDataDir };
  }

  const { chromium } = await import("playwright");
  const browser = await chromium.launch({
    headless: true,
    executablePath: customExecutable,
  });
  return { browser };
}
