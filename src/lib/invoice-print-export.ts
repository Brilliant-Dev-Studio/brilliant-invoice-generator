import { cookies } from "next/headers";
import type { Page } from "playwright-core";
import { invoice } from "@/lib/db";
import { launchPdfBrowser } from "@/lib/pdf-browser";
import { pdfRenderOrigin } from "@/lib/pdf-app-url";
import { COOKIE } from "@/lib/session";
import { mobileContext } from "@/lib/mobile-context";
import type { User } from "@/lib/types";

export type InvoiceExportStage =
  | "launch-browser"
  | "configure-browser"
  | "load-invoice"
  | "invoice-access"
  | "invoice-response"
  | "invoice-session"
  | "load-fonts"
  | "load-images"
  | "verify-watermark"
  | "render-pdf"
  | "render-png";

export const invoiceExportStageErrors: Record<
  InvoiceExportStage,
  { pdf: string; png: string }
> = {
  "launch-browser": {
    pdf: "PDF export failed: the server could not start the PDF browser. Reference: PDF-BROWSER.",
    png: "PNG export failed: the server could not start the export browser. Reference: PNG-BROWSER.",
  },
  "configure-browser": {
    pdf: "PDF export failed: the server could not prepare the PDF browser. Reference: PDF-SETUP.",
    png: "PNG export failed: the server could not prepare the export browser. Reference: PNG-SETUP.",
  },
  "load-invoice": {
    pdf: "PDF export failed: the server could not load the invoice page. Reference: PDF-PAGE.",
    png: "PNG export failed: the server could not load the invoice page. Reference: PNG-PAGE.",
  },
  "invoice-access": {
    pdf: "PDF export failed: access to the invoice page was denied. Reference: PDF-ACCESS.",
    png: "PNG export failed: access to the invoice page was denied. Reference: PNG-ACCESS.",
  },
  "invoice-response": {
    pdf: "PDF export failed: the invoice page returned an error. Reference: PDF-RESPONSE.",
    png: "PNG export failed: the invoice page returned an error. Reference: PNG-RESPONSE.",
  },
  "invoice-session": {
    pdf: "PDF export failed: the PDF browser could not open the authenticated invoice. Reference: PDF-SESSION.",
    png: "PNG export failed: the export browser could not open the authenticated invoice. Reference: PNG-SESSION.",
  },
  "load-fonts": {
    pdf: "PDF export failed: invoice fonts could not be loaded. Reference: PDF-FONTS.",
    png: "PNG export failed: invoice fonts could not be loaded. Reference: PNG-FONTS.",
  },
  "load-images": {
    pdf: "PDF export failed: an invoice image could not be loaded. Check the logo, payment QR, and signature. Reference: PDF-IMAGES.",
    png: "PNG export failed: an invoice image could not be loaded. Check the logo, payment QR, and signature. Reference: PNG-IMAGES.",
  },
  "verify-watermark": {
    pdf: "PDF export failed: the required demo watermark is missing. Reference: PDF-WATERMARK.",
    png: "PNG export failed: the required demo watermark is missing. Reference: PNG-WATERMARK.",
  },
  "render-pdf": {
    pdf: "PDF export failed: the invoice could not be converted to PDF. Reference: PDF-RENDER.",
    png: "PNG export failed: the invoice could not be converted to PNG. Reference: PNG-RENDER.",
  },
  "render-png": {
    pdf: "PDF export failed: the invoice could not be converted to PDF. Reference: PDF-RENDER.",
    png: "PNG export failed: the invoice could not be converted to PNG. Reference: PNG-RENDER.",
  },
};

type RenderFormat = "pdf" | "png";

export async function renderInvoiceExport(
  request: Request,
  user: User,
  id: string,
  format: RenderFormat,
  render: (page: Page, invoiceNumber: string) => Promise<Response>,
): Promise<Response> {
  const data = await invoice(id, user.companyId);
  if (!data)
    return Response.json({ error: "Invoice not found." }, { status: 404 });
  const token =
    mobileContext.getStore()?.token ?? (await cookies()).get(COOKIE)?.value;
  let base: string;
  try {
    base = pdfRenderOrigin(request);
  } catch {
    const label = format === "pdf" ? "PDF" : "PNG";
    return Response.json(
      { error: `${label} export requires APP_URL to be configured.` },
      { status: 503 },
    );
  }
  let browserSession: Awaited<ReturnType<typeof launchPdfBrowser>> | undefined;
  let stage: InvoiceExportStage = "launch-browser";
  try {
    browserSession = await launchPdfBrowser();
    stage = "configure-browser";
    const context = await browserSession.browser.newContext({
      deviceScaleFactor: format === "png" ? 2 : 1,
    });
    await context.addCookies([
      {
        name: COOKIE,
        value: token!,
        url: base,
        httpOnly: true,
        sameSite: "Lax",
        secure: base.startsWith("https:"),
      },
    ]);
    const page = await context.newPage();
    const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
    if (bypass) {
      await page.setExtraHTTPHeaders({
        "x-vercel-protection-bypass": bypass,
      });
    }
    stage = "load-invoice";
    const printUrl = `${base.replace(/\/$/, "")}/dashboard/invoices/${id}/print`;
    const response = await page.goto(printUrl, {
      waitUntil: "load",
      timeout: 60000,
    });
    if (!response?.ok()) {
      stage =
        response && [401, 403].includes(response.status())
          ? "invoice-access"
          : "invoice-response";
      throw new Error(
        `Print page returned HTTP ${response?.status() ?? "no response"}.`,
      );
    }
    await page.waitForSelector(".print-document .invoice-paper", {
      state: "visible",
      timeout: 30000,
    });
    if (new URL(page.url()).pathname !== `/dashboard/invoices/${id}/print`) {
      stage = "invoice-session";
      throw new Error("Print request redirected away from the invoice.");
    }
    stage = "load-fonts";
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    stage = "load-images";
    await page.evaluate(async () => {
      const wait = (image: HTMLImageElement, ms: number) =>
        new Promise<void>((resolve, reject) => {
          if (image.complete && image.naturalWidth > 0) {
            resolve();
            return;
          }
          const timer = window.setTimeout(
            () => reject(new Error("Image load timed out.")),
            ms,
          );
          image.addEventListener(
            "load",
            () => {
              window.clearTimeout(timer);
              resolve();
            },
            { once: true },
          );
          image.addEventListener(
            "error",
            () => {
              window.clearTimeout(timer);
              reject(new Error("Image failed to load."));
            },
            { once: true },
          );
        });
      await Promise.all(
        Array.from(document.images).map((image) =>
          image.decode().catch(() => wait(image, 20000)),
        ),
      );
    });
    stage = "verify-watermark";
    if (user.isDemo && !(await page.locator(".demo-print-watermark").count()))
      throw new Error("Demo watermark is required for export.");
    stage = format === "pdf" ? "render-pdf" : "render-png";
    return await render(page, data.number);
  } catch (error) {
    console.error(`Invoice ${format.toUpperCase()} export failed`, {
      stage,
      base,
      vercel: process.env.VERCEL === "1",
      error,
    });
    return Response.json(
      {
        error: invoiceExportStageErrors[stage][format],
        stage,
      },
      { status: 503 },
    );
  } finally {
    await browserSession?.browser.close().catch((closeError: unknown) => {
      console.error(`Invoice ${format} browser cleanup failed`, {
        error: closeError,
      });
    });
  }
}
