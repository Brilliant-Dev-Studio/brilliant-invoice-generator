/** Origin the PDF browser uses to open the authenticated print route. */
export function pdfAppUrl(): string | undefined {
  const configured = process.env.APP_URL?.trim();
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const deployment = process.env.VERCEL_URL?.trim();
  const candidate =
    configured ||
    (production
      ? production.startsWith("http")
        ? production
        : `https://${production}`
      : "") ||
    (deployment ? `https://${deployment}` : "");
  if (!candidate) return undefined;
  try {
    const url = new URL(candidate);
    if (process.env.NODE_ENV === "development" && url.hostname === "localhost") {
      url.hostname = "127.0.0.1";
    }
    return url.origin;
  } catch {
    return candidate.replace(/\/$/, "");
  }
}
