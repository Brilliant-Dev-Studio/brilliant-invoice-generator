import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  devIndicators: { position: "top-right" },
  turbopack: { root: process.cwd() },
  serverExternalPackages: ["pg", "playwright", "sharp", "@sparticuz/chromium"],
  outputFileTracingIncludes: {
    "/api/invoices/*/pdf": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};
export default nextConfig;
