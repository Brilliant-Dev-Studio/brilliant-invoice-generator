"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, Printer } from "lucide-react";
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
  const router = useRouter();
  return (
    <div className="export-actions no-print">
      <div className="heading-actions">
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer size={16} /> <T text="Print" />
        </Button>
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
              const url = URL.createObjectURL(await r.blob());
              const a = document.createElement("a");
              a.href = url;
              a.download = `${number}.pdf`;
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            } catch (e) {
              setError(e instanceof Error ? e.message : "PDF download failed.");
            } finally {
              setPending("");
            }
          }}
        >
          <Download size={16} />
          {pending === "pdf" ? (
            <T text="Preparing PDF..." />
          ) : (
            <T text="Download PDF" />
          )}
        </Button>
        {canPay && (
          <Button
            variant="secondary"
            disabled={!!pending}
            onClick={async () => {
              setPending("paid");
              try {
                const result = await markPaid(id);
                if (!result.ok) setError(result.error);
                else router.refresh();
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
      {error && (
        <p className="message error" role="alert">
          <T text={error} />
        </p>
      )}
    </div>
  );
}
