"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, Printer, Share2 } from "lucide-react";
import { markPaid } from "@/actions/invoices";
import { Button } from "./ui/button";
import { T } from "@/components/language-provider";
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
  const [pdf, setPdf] = useState<{
    url: string;
    file: File;
    canShare: boolean;
  } | null>(null);
  useEffect(() => {
    // Keep the URL alive while the browser's PDF viewer or download uses it.
    return () => {
      if (pdf) URL.revokeObjectURL(pdf.url);
    };
  }, [pdf]);
  const router = useRouter();
  return (
    <div className="export-actions no-print">
      <div className="heading-actions">
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer size={16} /> <T text="Print" />
        </Button>
        {pdf ? (
          <Button asChild>
            <a href={pdf.url} download={pdf.file.name}>
              <Download size={16} /> <T text="Download PDF" />
            </a>
          </Button>
        ) : (
          <Button
            disabled={!!pending}
            onClick={async () => {
              setPending("pdf");
              setError("");
              try {
                const r = await fetch(`/api/invoices/${id}/pdf`);
                if (!r.ok) {
                  const data = await r.json();
                  throw new Error(data.error || "PDF download failed.");
                }
                const file = new File([await r.blob()], `${number}.pdf`, {
                  type: "application/pdf",
                });
                const canShare =
                  !!navigator.share &&
                  !!navigator.canShare?.({ files: [file] });
                // Download/share must start from a fresh tap on tablet browsers.
                setPdf({ url: URL.createObjectURL(file), file, canShare });
              } catch (e) {
                setError(
                  e instanceof Error ? e.message : "PDF download failed.",
                );
              } finally {
                setPending("");
              }
            }}
          >
            <Download size={16} />
            {pending === "pdf" ? (
              <T text="Preparing PDF..." />
            ) : (
              <T text="Prepare PDF" />
            )}
          </Button>
        )}
        {pdf?.canShare && (
          <Button
            variant="secondary"
            disabled={!!pending}
            onClick={async () => {
              setError("");
              setPending("share");
              try {
                await navigator.share({ files: [pdf.file] });
              } catch (e) {
                if (!(e instanceof Error && e.name === "AbortError"))
                  setError("Could not share PDF. Please use Download PDF.");
              } finally {
                setPending("");
              }
            }}
          >
            <Share2 size={16} /> <T text="Share PDF" />
          </Button>
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
          <T text="PDF ready. Tap Download PDF to save it, or Share PDF to choose where to save it." />
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
