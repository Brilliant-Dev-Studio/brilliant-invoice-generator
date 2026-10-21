"use client";
import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import { INVOICE_TEMPLATES, type InvoiceDesign } from "@/lib/invoice-design";
import { T, useTranslations } from "./language-provider";
import "./invoice-design.css";

const colors = [
  { name: "Forest", value: "#416f59" },
  { name: "Ocean", value: "#285a89" },
  { name: "Terracotta", value: "#a64d38" },
  { name: "Burgundy", value: "#803c50" },
  { name: "Charcoal", value: "#364149" },
  { name: "Gold", value: "#a47723" },
];
const names = {
  studio: "Studio",
  minimal: "Minimal",
  classic: "Classic",
  executive: "Executive",
  editorial: "Editorial",
  ledger: "Ledger",
  modern: "Modern",
  boutique: "Boutique",
  corporate: "Corporate",
  signature: "Signature",
};
export function InvoiceDesignPicker({
  value,
  onChange,
  disabled,
  note = "This design is saved with your invoice.",
}: {
  value: InvoiceDesign;
  onChange: (value: InvoiceDesign) => void;
  disabled: boolean;
  note?: string;
}) {
  const t = useTranslations();
  return (
    <details className="invoice-design-picker" open>
      <summary>
        <T text="Invoice design" />
        <span>
          <T text={names[value.template]} /> /{" "}
          <T text={value.theme === "light" ? "Light" : "Dark"} />
        </span>
      </summary>
      <fieldset disabled={disabled}>
        <legend className="sr-only">
          <T text="Invoice design" />
        </legend>
        <div
          className="design-templates"
          role="group"
          aria-label={t("Template")}
        >
          {INVOICE_TEMPLATES.map((template) => (
            <button
              type="button"
              key={template}
              className={`design-template ${value.template === template ? "selected" : ""}`}
              aria-pressed={value.template === template}
              onClick={() => onChange({ ...value, template })}
            >
              <span
                className={`design-miniature ${template}`}
                style={{ "--swatch": value.accent } as CSSProperties}
                aria-hidden="true"
              >
                <i />
                <i />
                <i />
                <i />
              </span>
              <span>
                <T text={names[template]} />
                {value.template === template && <Check size={13} />}
              </span>
            </button>
          ))}
        </div>
        <div className="design-theme-row">
          <span>
            <T text="Paper theme" />
          </span>
          <div role="group" aria-label={t("Paper theme")}>
            {(["light", "dark"] as const).map((theme) => (
              <button
                key={theme}
                type="button"
                aria-pressed={value.theme === theme}
                onClick={() => onChange({ ...value, theme })}
              >
                <T text={theme === "light" ? "Light" : "Dark"} />
              </button>
            ))}
          </div>
        </div>
        <div className="design-color-heading">
          <span>
            <T text="Accent color" />
          </span>
          <span>{value.accent.toUpperCase()}</span>
        </div>
        <div
          className="design-swatches"
          role="group"
          aria-label={t("Accent color")}
        >
          {colors.map((color) => (
            <button
              key={color.value}
              type="button"
              title={t(color.name)}
              aria-label={t(color.name)}
              aria-pressed={value.accent.toLowerCase() === color.value}
              onClick={() => onChange({ ...value, accent: color.value })}
            >
              <span style={{ backgroundColor: color.value }} />
              {value.accent.toLowerCase() === color.value && (
                <Check size={15} />
              )}
            </button>
          ))}
          <label className="design-custom-color">
            <span className="sr-only">
              <T text="Custom accent color" />
            </span>
            <input
              type="color"
              aria-label={t("Custom accent color")}
              value={value.accent}
              onChange={(event) =>
                onChange({ ...value, accent: event.target.value })
              }
            />
          </label>
        </div>
        <p>
          <T text={note} />
        </p>
      </fieldset>
    </details>
  );
}
