"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Download,
  ExternalLink,
  ImageDown,
  Printer,
  Share2,
} from "lucide-react";
import { markPaid } from "@/actions/invoices";
import {
  canShareFile,
  canSharePdfFile,
  downloadPdfViaLink,
  downloadPngViaLink,
  isTouchLikeDevice,
  openPdfBlob,
  pdfExportErrorMessage,
  pngExportErrorMessage,
  preferredPdfDelivery,
  shareFile,
  sharePdfFile,
} from "@/lib/pdf-client";
import { Button } from "./ui/button";
import { T } from "./language-provider";

type ExportKind = "pdf" | "png";
type ExportReady = { url: string; file: File; canShare: boolean; kind: ExportKind };

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
  const [ready, setReady] = useState<ExportReady | null>(null);
  const [touchUi, setTouchUi] = useState(false);
  useEffect(() => {
    setTouchUi(isTouchLikeDevice());
  }, []);
  useEffect(() => {
    return () => {
      if (ready) URL.revokeObjectURL(ready.url);
    };
  }, [ready]);
  const router = useRouter();

  async function deliverExport(file: File, url: string, kind: ExportKind) {
    const mode = preferredPdfDelivery(file);
    if (mode === "share") {
      try {
        await shareFile(file);
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
      if (kind === "pdf") downloadPdfViaLink(url, file.name);
      else downloadPngViaLink(url, file.name);
      setReady({ url, file, canShare: canShareFile(file), kind });
      return;
    }
    if (kind === "pdf") {
      openPdfBlob(url);
      setReady({ url, file, canShare: canSharePdfFile(file), kind });
      return;
    }
    if (kind === "png") downloadPngViaLink(url, file.name);
    setReady({ url, file, canShare: canShareFile(file), kind });
  }

  async function fetchExport(kind: ExportKind) {
    setPending(kind);
    setError("");
    try {
      const r = await fetch(`/api/invoices/${id}/${kind}`, {
        credentials: "same-origin",
      });
      const data = r.ok ? null : await r.json().catch(() => ({}));
      if (!r.ok) {
        const message =
          typeof data?.error === "string"
            ? data.error
            : kind === "pdf"
              ? "PDF download failed."
              : "PNG download failed.";
        const stage =
          typeof data?.stage === "string" ? data.stage : undefined;
        throw new Error(
          kind === "pdf"
            ? pdfExportErrorMessage(message, stage)
            : pngExportErrorMessage(message, stage),
        );
      }
      const ext = kind === "pdf" ? "pdf" : "png";
      const mime = kind === "pdf" ? "application/pdf" : "image/png";
      const file = new File([await r.blob()], `${number}.${ext}`, { type: mime });
      const url = URL.createObjectURL(file);
      if (ready) URL.revokeObjectURL(ready.url);
      await deliverExport(file, url, kind);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setPending("");
    }
  }

  const pdfReady = ready?.kind === "pdf" ? ready : null;
  const pngReady = ready?.kind === "png" ? ready : null;

  return (
    <div className="export-actions no-print">
      <div className="heading-actions">
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer size={16} /> <T text="Print" />
        </Button>
        {!pdfReady ? (
          <Button disabled={!!pending} onClick={() => fetchExport("pdf")}>
            <Download size={16} />
            {pending === "pdf" ? (
              <T text="Preparing PDF..." />
            ) : (
              <T text="Save PDF" />
            )}
          </Button>
        ) : (
          <>
            {pdfReady.canShare && (
              <Button
                disabled={!!pending}
                onClick={async () => {
                  setError("");
                  setPending("share-pdf");
                  try {
                    await sharePdfFile(pdfReady.file);
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
              variant={pdfReady.canShare ? "secondary" : undefined}
              disabled={!!pending}
              onClick={() => downloadPdfViaLink(pdfReady.url, pdfReady.file.name)}
            >
              <Download size={16} /> <T text="Download PDF" />
            </Button>
            {(touchUi || !pdfReady.canShare) && (
              <Button
                variant="secondary"
                disabled={!!pending}
                onClick={() => openPdfBlob(pdfReady.url)}
              >
                <ExternalLink size={16} /> <T text="Open PDF" />
              </Button>
            )}
          </>
        )}
        {!pngReady ? (
          <Button
            variant="secondary"
            disabled={!!pending}
            onClick={() => fetchExport("png")}
          >
            <ImageDown size={16} />
            {pending === "png" ? (
              <T text="Preparing PNG..." />
            ) : (
              <T text="Save to gallery" />
            )}
          </Button>
        ) : (
          <>
            {pngReady.canShare && (
              <Button
                disabled={!!pending}
                onClick={async () => {
                  setError("");
                  setPending("share-png");
                  try {
                    await shareFile(pngReady.file);
                  } catch (e) {
                    if (!(e instanceof Error && e.name === "AbortError"))
                      setError(
                        "Could not save PNG to gallery. Try Download PNG or Print.",
                      );
                  } finally {
                    setPending("");
                  }
                }}
              >
                <Share2 size={16} /> <T text="Save PNG to gallery" />
              </Button>
            )}
            <Button
              variant="secondary"
              disabled={!!pending}
              onClick={() =>
                downloadPngViaLink(pngReady.url, pngReady.file.name)
              }
            >
              <ImageDown size={16} /> <T text="Download PNG" />
            </Button>
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
                  if (ready) URL.revokeObjectURL(ready.url);
                  setReady(null);
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
      {pdfReady && (
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
      {pngReady && (
        <p className="message" role="status">
          <T
            text={
              touchUi
                ? "PNG ready. Use Save PNG to gallery for Photos, or Download PNG."
                : "PNG ready. Download PNG to save the invoice image."
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
