import { chromium } from "playwright";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { invoice } from "@/lib/db";
import { COOKIE } from "@/lib/session";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await params;
  const data = await invoice(id, user.companyId);
  if (!data)
    return Response.json({ error: "Invoice not found." }, { status: 404 });
  const token = (await cookies()).get(COOKIE)?.value;
  const base = process.env.APP_URL;
  if (!base)
    return Response.json(
      { error: "PDF export requires APP_URL to be configured." },
      { status: 503 },
    );
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined,
    });
    const context = await browser.newContext();
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
    const response = await page.goto(
      `${base.replace(/\/$/, "")}/dashboard/invoices/${id}/print`,
      { waitUntil: "networkidle", timeout: 30000 },
    );
    if (!response?.ok() || !page.url().includes(`/invoices/${id}/print`))
      throw new Error("Unauthorized print request.");
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images).map((image) => image.decode()),
      );
    });
    if (user.isDemo && !(await page.locator(".demo-print-watermark").count()))
      throw new Error("Demo watermark is required for export.");
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
  } catch {
    return Response.json(
      {
        error:
          "PDF export is unavailable. Check the server Chromium installation, APP_URL, and invoice images. You can still use Print to save a PDF.",
      },
      { status: 503 },
    );
  } finally {
    await browser?.close();
  }
}
