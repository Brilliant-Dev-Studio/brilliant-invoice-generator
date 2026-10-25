function isLoopbackOrigin(origin: string) {
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

function normalizeOrigin(value: string): string | undefined {
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    if (process.env.NODE_ENV === "development" && url.hostname === "localhost") {
      url.hostname = "127.0.0.1";
    }
    return url.origin;
  } catch {
    const trimmed = value.replace(/\/$/, "");
    return trimmed || undefined;
  }
}

function requestOrigin(request: Request) {
  try {
    return new URL(request.url).origin;
  } catch {
    return undefined;
  }
}

/** Configured origin from env (APP_URL, then Vercel production/deployment URLs). */
export function configuredPdfAppUrl(): string | undefined {
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
  return normalizeOrigin(candidate);
}

/**
 * Origin Playwright uses to open the print route. Prefer the caller's request
 * host in production so PDF works when APP_URL is stale or localhost on Vercel.
 */
export function pdfRenderOrigin(request: Request): string {
  const fromRequest = requestOrigin(request);
  const configured = configuredPdfAppUrl();

  if (process.env.NODE_ENV === "development") {
    if (configured && isLoopbackOrigin(configured)) return configured;
    if (fromRequest && !isLoopbackOrigin(fromRequest) && configured)
      return configured;
  }

  if (fromRequest) return fromRequest;
  if (configured) return configured;
  throw new Error("PDF export requires APP_URL or a valid request host.");
}

/** @deprecated Use configuredPdfAppUrl or pdfRenderOrigin */
export function pdfAppUrl(): string | undefined {
  return configuredPdfAppUrl();
}
