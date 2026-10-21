import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_INVOICE_DESIGN,
  INVOICE_TEMPLATES,
  INVOICE_THEMES,
  contrastRatio,
  invoiceDesignColors,
} from "../src/lib/invoice-design.ts";
import { invoiceSchema, invoiceDesignSchema } from "../src/lib/validation.ts";
import { calculate } from "../src/lib/money.ts";

const input = {
  clientId: "12345678-1234-4234-8234-123456789012",
  title: "Design project",
  currency: "USD",
  issueDate: "2026-10-21",
  dueDate: "2026-10-28",
  terms: "Net 7",
  payment: "",
  discountType: "FIXED",
  discount: "0",
  tax: "5",
  items: [
    {
      id: "12345678-1234-4234-8234-123456789013",
      description: "Design",
      quantity: "2",
      price: "100",
    },
  ],
};

test("legacy inputs get defaults and every design survives validation and JSON storage", () => {
  assert.deepEqual(invoiceSchema.parse(input).design, DEFAULT_INVOICE_DESIGN);
  for (const template of INVOICE_TEMPLATES)
    for (const theme of INVOICE_THEMES) {
      const design = { template, theme, accent: "#ABC123" };
      const saved = invoiceSchema.parse({ ...input, design });
      assert.deepEqual(JSON.parse(JSON.stringify(saved)).design, design);
      assert.equal(calculate(saved).total, 21000);
    }
});

test("unsupported templates, themes, and CSS injection are rejected", () => {
  for (const design of [
    { ...DEFAULT_INVOICE_DESIGN, template: "unknown" },
    { ...DEFAULT_INVOICE_DESIGN, theme: "system" },
    {
      ...DEFAULT_INVOICE_DESIGN,
      accent: "red; background:url(https://example.com)",
    },
    { ...DEFAULT_INVOICE_DESIGN, accent: "#fff" },
  ])
    assert.equal(invoiceDesignSchema.safeParse(design).success, false);
});

test("custom accents maintain readable header and paper text in both themes", () => {
  const accents = [
    "#416f59",
    "#285a89",
    "#a64d38",
    "#803c50",
    "#364149",
    "#a47723",
    "#ffffff",
    "#000000",
    "#777777",
    "#ffff00",
    "#00ff00",
    "#ff00ff",
  ];
  for (const theme of INVOICE_THEMES)
    for (const accent of accents) {
      const colors = invoiceDesignColors({ template: "studio", theme, accent });
      assert.ok(contrastRatio(colors.accent, colors.onAccent) >= 4.5, accent);
      assert.ok(contrastRatio(colors.ink, colors.background) >= 4.5, accent);
      assert.ok(contrastRatio(colors.text, colors.background) >= 4.5);
      assert.ok(contrastRatio(colors.muted, colors.background) >= 4.5);
    }
});
