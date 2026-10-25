/** Origin the PDF browser uses to open the authenticated print route. */
export function pdfAppUrl(): string | undefined {
  const configured = process.env.APP_URL?.trim();
  if (!configured) return undefined;
  try {
    const url = new URL(configured);
    if (process.env.NODE_ENV === "development" && url.hostname === "localhost") {
      url.hostname = "127.0.0.1";
    }
    return url.origin;
  } catch {
    return configured.replace(/\/$/, "");
  }
}
