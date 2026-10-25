"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, ExternalLink, Printer, Share2 } from "lucide-react";
import { markPaid } from "@/actions/invoices";
import {
  canSharePdfFile,
  downloadPdfViaLink,
  isTouchLikeDevice,
  openPdfBlob,
  pdfExportErrorMessage,
  preferredPdfDelivery,
  sharePdfFile,
} from "@/lib/pdf-client";
import { Button } from "./ui/button";
import { T } from "./language-provider";

type PdfReady = { url: string; file: File; canShare: boolean };

export function InvoiceActions({
  id,
  number,
  canPay,
}: {
  id: string;
  number: string;
  canPay: boolean;
}) {
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [pdf, setPdf] = useState<PdfReady | null>(null);
  const [touchUi, setTouchUi] = useState(false);
  useEffect(() => {
    setTouchUi(isTouchLikeDevice());
  }, []);
  useEffect(() => {
    return () => {
      if (pdf) URL.revokeObjectURL(pdf.url);
    };
  }, [pdf]);
  const router = useRouter();

  async function deliverPdf(file: File, url: string) {
    const mode = preferredPdfDelivery(file);
    if (mode === "share") {
      try {
        await sharePdfFile(file);
        URL.revokeObjectURL(url);
        return;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          URL.revokeObjectURL(url);
          return;
        }
      }
    }
    if (mode === "download") {
      downloadPdfViaLink(url, file.name);
      setPdf({ url, file, canShare: canSharePdfFile(file) });
      return;
    }
    openPdfBlob(url);
    setPdf({ url, file, canShare: canSharePdfFile(file) });
  }

  async function fetchPdf() {
    setPending("pdf");
    setError("");
    try {
      const r = await fetch(`/api/invoices/${id}/pdf`, {
        credentials: "same-origin",
      });
      const data = r.ok ? null : await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(
          pdfExportErrorMessage(
            typeof data?.error === "string"
              ? data.error
              : "PDF download failed.",
            typeof data?.stage === "string" ? data.stage : undefined,
          ),
        );
      }
      const file = new File([await r.blob()], `${number}.pdf`, {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(file);
      await deliverPdf(file, url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF download failed.");
    } finally {
      setPending("");
    }
  }

  return (
    <div className="export-actions no-print">
      <div className="heading-actions">
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer size={16} /> <T text="Print" />
        </Button>
        {!pdf ? (
          <Button disabled={!!pending} onClick={fetchPdf}>
            <Download size={16} />
            {pending === "pdf" ? (
              <T text="Preparing PDF..." />
            ) : (
              <T text="Save PDF" />
            )}
          </Button>
        ) : (
          <>
            {pdf.canShare && (
              <Button
                disabled={!!pending}
                onClick={async () => {
                  setError("");
                  setPending("share");
                  try {
                    await sharePdfFile(pdf.file);
                  } catch (e) {
                    if (!(e instanceof Error && e.name === "AbortError"))
                      setError(
                        "Could not share PDF. Try Open PDF or use Print.",
                      );
                  } finally {
                    setPending("");
                  }
                }}
              >
                <Share2 size={16} /> <T text="Share PDF" />
              </Button>
            )}
            <Button
              variant={pdf.canShare ? "secondary" : undefined}
              disabled={!!pending}
              onClick={() => downloadPdfViaLink(pdf.url, pdf.file.name)}
            >
              <Download size={16} /> <T text="Download PDF" />
            </Button>
            {(touchUi || !pdf.canShare) && (
              <Button
                variant="secondary"
                disabled={!!pending}
                onClick={() => openPdfBlob(pdf.url)}
              >
                <ExternalLink size={16} /> <T text="Open PDF" />
              </Button>
            )}
          </>
        )}
        {canPay && (
          <Button
            variant="secondary"
            disabled={!!pending}
            onClick={async () => {
              setPending("paid");
              try {
                const result = await markPaid(id);
                if (!result.ok) setError(result.error);
                else {
                  setPdf(null);
                  router.refresh();
                }
              } catch {
                setError("Could not update payment status.");
              } finally {
                setPending("");
              }
            }}
          >
            <Check size={16} />
            <T text="Mark paid" />
          </Button>
        )}
      </div>
      {pdf && (
        <p className="message" role="status">
          <T
            text={
              touchUi
                ? "PDF ready. Use Share PDF to save to Files or another app, Open PDF in the browser, or Print from the invoice."
                : "PDF ready. Download PDF to save it, Share PDF on supported devices, or use Print."
            }
          />
        </p>
      )}
      {error && (
        <p className="message error" role="alert">
          <T text={error} />
        </p>
      )}
    </div>
  );
}
