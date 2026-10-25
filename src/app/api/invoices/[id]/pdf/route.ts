import { rm } from "node:fs/promises";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { launchPdfBrowser } from "@/lib/pdf-browser";
import { invoice } from "@/lib/db";
import { pdfRenderOrigin } from "@/lib/pdf-app-url";
import { COOKIE } from "@/lib/session";
export const runtime = "nodejs";
export const maxDuration = 60;
const exportErrors = {
  "launch-browser":
    "PDF export failed: the server could not start the PDF browser. Reference: PDF-BROWSER.",
  "configure-browser":
    "PDF export failed: the server could not prepare the PDF browser. Reference: PDF-SETUP.",
  "load-invoice":
    "PDF export failed: the server could not load the invoice page. Reference: PDF-PAGE.",
  "invoice-access":
    "PDF export failed: access to the invoice page was denied. Reference: PDF-ACCESS.",
  "invoice-response":
    "PDF export failed: the invoice page returned an error. Reference: PDF-RESPONSE.",
  "invoice-session":
    "PDF export failed: the PDF browser could not open the authenticated invoice. Reference: PDF-SESSION.",
  "load-fonts":
    "PDF export failed: invoice fonts could not be loaded. Reference: PDF-FONTS.",
  "load-images":
    "PDF export failed: an invoice image could not be loaded. Check the logo, payment QR, and signature. Reference: PDF-IMAGES.",
  "verify-watermark":
    "PDF export failed: the required demo watermark is missing. Reference: PDF-WATERMARK.",
  "render-pdf":
    "PDF export failed: the invoice could not be converted to PDF. Reference: PDF-RENDER.",
};
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await params;
  const data = await invoice(id, user.companyId);
  if (!data)
    return Response.json({ error: "Invoice not found." }, { status: 404 });
  const token = (await cookies()).get(COOKIE)?.value;
  let base: string;
  try {
    base = pdfRenderOrigin(request);
  } catch {
    return Response.json(
      { error: "PDF export requires APP_URL to be configured." },
      { status: 503 },
    );
  }
  let browserSession: Awaited<ReturnType<typeof launchPdfBrowser>> | undefined;
  let stage: keyof typeof exportErrors = "launch-browser";
  try {
    browserSession = await launchPdfBrowser();
    stage = "configure-browser";
    const context = await browserSession.browser.newContext();
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
    stage = "render-pdf";
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${data.number}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Invoice PDF export failed", {
      stage,
      base,
      vercel: process.env.VERCEL === "1",
      error,
    });
    return Response.json(
      {
        error: exportErrors[stage],
        stage,
      },
      { status: 503 },
    );
  } finally {
    await browserSession?.browser.close().catch((error: unknown) => {
      console.error("Invoice PDF browser cleanup failed", { error });
    });
    const userDataDir = browserSession?.userDataDir;
    if (userDataDir) {
      await rm(userDataDir, { recursive: true, force: true }).catch(
        (error: unknown) => {
          console.error("Invoice PDF user data cleanup failed", { error });
        },
      );
    }
  }
}
