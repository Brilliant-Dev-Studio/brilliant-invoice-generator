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
  return renderInvoiceExport(request, user, id, "pdf", async (page, number) => {
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${number}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  });
}
