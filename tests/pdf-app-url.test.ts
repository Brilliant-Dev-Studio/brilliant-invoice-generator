import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import {
  configuredPdfAppUrl,
  pdfRenderOrigin,
} from "../src/lib/pdf-app-url.ts";

const env = process.env;

describe("pdfRenderOrigin", () => {
  beforeEach(() => {
    process.env = { ...env };
  });
  afterEach(() => {
    process.env = env;
  });

  it("prefers the request host in production when APP_URL is localhost", () => {
    process.env = {
      ...env,
      NODE_ENV: "production",
      APP_URL: "http://localhost:3000",
    };
    const origin = pdfRenderOrigin(
      new Request("https://sanpya.example.com/api/invoices/x/pdf"),
    );
    assert.equal(origin, "https://sanpya.example.com");
  });

  it("uses loopback APP_URL in development", () => {
    process.env = {
      ...env,
      NODE_ENV: "development",
      APP_URL: "http://localhost:3000",
    };
    const origin = pdfRenderOrigin(
      new Request("http://192.168.0.5:3000/api/invoices/x/pdf"),
    );
    assert.equal(origin, "http://127.0.0.1:3000");
  });

  it("falls back to VERCEL_URL when APP_URL is unset", () => {
    delete process.env.APP_URL;
    process.env.VERCEL_URL = "my-app.vercel.app";
    assert.equal(
      configuredPdfAppUrl(),
      "https://my-app.vercel.app",
    );
  });
});
