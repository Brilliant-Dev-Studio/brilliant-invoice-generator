import { isAppleTouchDevice } from "./apple-touch";

export function isTouchLikeDevice() {
  if (typeof window === "undefined") return false;
  if (isAppleTouchDevice()) return true;
  if (/Android|Mobile/i.test(navigator.userAgent)) return true;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function canShareFile(file: File) {
  return !!(
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    navigator.canShare?.({ files: [file] })
  );
}

export function canSharePdfFile(file: File) {
  return canShareFile(file);
}

export async function shareFile(file: File) {
  await navigator.share({ files: [file], title: file.name });
}

export async function sharePdfFile(file: File) {
  await shareFile(file);
}

export function canSharePngFile(file: File) {
  return canShareFile(file);
}

export async function sharePngFile(file: File) {
  await shareFile(file);
}

export function openPdfBlob(url: string) {
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) window.location.assign(url);
}

export function downloadViaLink(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
}

export function downloadPdfViaLink(url: string, filename: string) {
  downloadViaLink(url, filename);
}

export function downloadPngViaLink(url: string, filename: string) {
  downloadViaLink(url, filename);
}

export type PdfDelivery = "share" | "download" | "open";

export function preferredPdfDelivery(file: File): PdfDelivery {
  if (canSharePdfFile(file)) return "share";
  if (isTouchLikeDevice()) return "open";
  return "download";
}

const stageMessages: Record<string, string> = {
  "launch-browser":
    "PDF export is not available on the server (browser could not start). Use Print, or contact support.",
  "configure-browser":
    "PDF export is not available on the server (browser setup failed). Use Print, or contact support.",
  "load-invoice":
    "PDF export could not load the invoice page. The server APP_URL may be wrong, or the request timed out. Try Print instead.",
  "invoice-access":
    "PDF export was denied. Sign in again and retry, or use Print.",
  "invoice-response":
    "PDF export received an error from the invoice page. Try Print, or ask your administrator to check APP_URL.",
  "invoice-session":
    "PDF export lost your session. Sign in again and retry, or use Print.",
  "load-fonts":
    "PDF export could not load invoice fonts. Try Print.",
  "load-images":
    "PDF export could not load a logo, QR code, or signature. Fix company images in Settings, or use Print.",
  "verify-watermark":
    "PDF export could not verify the demo watermark. Try again or use Print.",
  "render-pdf":
    "PDF export could not render the file. Try Print.",
  "render-png":
    "PNG export could not render the image. Try Print.",
};

const pngStageMessages: Record<string, string> = {
  "launch-browser":
    "PNG export is not available on the server (browser could not start). Use Print, or contact support.",
  "configure-browser":
    "PNG export is not available on the server (browser setup failed). Use Print, or contact support.",
  "load-invoice":
    "PNG export could not load the invoice page. The server APP_URL may be wrong, or the request timed out. Try Print instead.",
  "invoice-access":
    "PNG export was denied. Sign in again and retry, or use Print.",
  "invoice-response":
    "PNG export received an error from the invoice page. Try Print, or ask your administrator to check APP_URL.",
  "invoice-session":
    "PNG export lost your session. Sign in again and retry, or use Print.",
  "load-fonts": "PNG export could not load invoice fonts. Try Print.",
  "load-images":
    "PNG export could not load a logo, QR code, or signature. Fix company images in Settings, or use Print.",
  "verify-watermark":
    "PNG export could not verify the demo watermark. Try again or use Print.",
  "render-png": "PNG export could not render the image. Try Print.",
  "render-pdf": "PNG export could not render the image. Try Print.",
};

export function pdfExportErrorMessage(
  fallback: string,
  stage?: string,
): string {
  if (stage && stageMessages[stage]) return stageMessages[stage];
  return fallback;
}

export function pngExportErrorMessage(
  fallback: string,
  stage?: string,
): string {
  if (stage && pngStageMessages[stage]) return pngStageMessages[stage];
  return fallback;
}
