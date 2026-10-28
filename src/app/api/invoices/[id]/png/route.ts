import { requireUser } from "@/lib/auth";
import { renderInvoiceExport } from "@/lib/invoice-print-export";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await params;
  return renderInvoiceExport(request, user, id, "png", async (page, number) => {
    const png = await page
      .locator(".print-document .invoice-paper")
      .screenshot({ type: "png" });
    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${number}.png"`,
        "Cache-Control": "private, no-store",
      },
    });
  });
}
