"use client";

import { useEffect, useRef, useState } from "react";
import type { Company, InvoiceInput } from "@/lib/types";
import { calculate } from "@/lib/money";
import { InvoicePreview } from "./invoice-preview";
import { InvoicePreviewStage } from "./invoice-preview-stage";
import { T } from "./language-provider";
import { Box } from "lucide-react";
import { Button } from "./ui/button";
import { InvoiceShowcase } from "./invoice-showcase";

const sample: InvoiceInput = {
  clientId: "sample",
  title: "Brand identity & design",
  currency: "MMK",
  issueDate: "2026-10-01",
  dueDate: "2026-10-15",
  terms: "Payment due within 14 days. Thank you for your business.",
  items: [
    {
      id: "design",
      description: "Brand identity design",
      quantity: "1",
      price: "850",
    },
    {
      id: "assets",
      description: "Social media assets",
      quantity: "4",
      price: "75",
    },
  ],
  discountType: "PERCENT",
  discount: "0",
  tax: "5",
  payment: "",
};
const totals = calculate(sample);

export function SettingsInvoicePreview({ company }: { company: Company }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [showcase, setShowcase] = useState(false);
  const previewProps = {
    data: { ...sample, design: company.invoiceDesign },
    company,
    client: {
      id: "sample",
      companyId: company.id,
      name: "Acme Studio",
      email: "hello@example.com",
      address: "24 Garden Street",
      phone: "",
    },
    number: "INV-0001",
    totals,
  };

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(entry.contentRect.width / 720, 1));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="settings-invoice-preview">
      <div className="settings-preview-heading">
        <strong>
          <T text="Invoice preview" />
        </strong>
        <span>
          <T text="Sample invoice" />
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setShowcase(true)}
        >
          <Box size={16} aria-hidden="true" />
          <T text="3D View" />
        </Button>
      </div>
      <div className="settings-preview-stage">
        <InvoicePreviewStage>
          <div className="settings-preview-viewport" ref={viewport}>
            <div className="settings-preview-paper" style={{ zoom: scale }}>
              <InvoicePreview {...previewProps} />
            </div>
          </div>
        </InvoicePreviewStage>
      </div>
      <InvoiceShowcase
        {...previewProps}
        open={showcase}
        onClose={() => setShowcase(false)}
        backLabel="Back to Settings"
      />
    </aside>
  );
}
