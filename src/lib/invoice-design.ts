export const INVOICE_TEMPLATES = [
  "studio",
  "minimal",
  "classic",
  "executive",
  "editorial",
  "ledger",
  "modern",
  "boutique",
  "corporate",
  "signature",
] as const;
export const INVOICE_THEMES = ["light", "dark"] as const;
export type InvoiceDesign = {
  template: (typeof INVOICE_TEMPLATES)[number];
  theme: (typeof INVOICE_THEMES)[number];
  accent: string;
};
export const DEFAULT_INVOICE_DESIGN: InvoiceDesign = {
  template: "studio",
  theme: "light",
  accent: "#416f59",
};
function luminance(hex: string) {
  const channels = [1, 3, 5].map((index) => {
    const value = parseInt(hex.slice(index, index + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
export function contrastRatio(a: string, b: string) {
  const first = luminance(a),
    second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
export function invoiceDesignColors(design: InvoiceDesign) {
  const accent = /^#[0-9a-f]{6}$/i.test(design.accent)
    ? design.accent
    : DEFAULT_INVOICE_DESIGN.accent;
  const dark = design.theme === "dark";
  const background = dark ? "#1b2427" : "#fffefa";
  const onAccent =
    contrastRatio(accent, "#ffffff") >= 4.5
      ? "#ffffff"
      : contrastRatio(accent, "#172033") >= 4.5
        ? "#172033"
        : "#000000";
  let ink = accent;
  // Keep the selected hue while making small text readable on the paper.
  for (
    let step = 1;
    contrastRatio(ink, background) < 4.5 && step <= 20;
    step++
  ) {
    ink =
      "#" +
      [1, 3, 5]
        .map((index) => {
          const channel = parseInt(accent.slice(index, index + 2), 16);
          return Math.round(
            channel + (((dark ? 255 : 0) - channel) * step) / 20,
          )
            .toString(16)
            .padStart(2, "0");
        })
        .join("");
  }
  return {
    accent,
    onAccent,
    ink,
    background,
    text: dark ? "#eef2eb" : "#26342e",
    muted: dark ? "#b9c5bf" : "#59675f",
    line: dark ? "#43514b" : "#dce3db",
  };
}
