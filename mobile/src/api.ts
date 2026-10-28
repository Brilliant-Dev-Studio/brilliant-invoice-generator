import { NativeModules } from "react-native";
import type { Client, Company, Invoice, User } from "../../src/lib/types";

export type Workspace = {
  user: User;
  company: Company;
  clients: Client[];
  invoices: Invoice[];
  today: string;
  overview: Record<
    "MMK" | "USD" | "THB",
    {
      revenue: number;
      outstanding: number;
      count: number;
      manualRevenue: boolean;
      manualOutstanding: boolean;
      manualCount: boolean;
    }
  >;
};
export type Session = { origin: string; token: string };
export const device = NativeModules.BrilliantDevice as {
  loadSession(): Promise<string | null>;
  saveSession(value: string): Promise<boolean>;
  clearSession(): Promise<boolean>;
  uuid(): Promise<string>;
  loadPreferences(): Promise<{ locale: string; theme: string }>;
  savePreferences(locale: string, theme: string): Promise<boolean>;
  symbol(name: string): Promise<string>;
  pickImage(): Promise<string | null>;
  drawSignature(): Promise<string | null>;
  requestJson(
    origin: string,
    path: string,
    token: string,
    body: string | null,
  ): Promise<{
    status: number;
    body: { ok?: boolean; data?: unknown; error?: string } | null;
  }>;
  sharePdf(
    origin: string,
    token: string,
    id: string,
    preview: boolean,
  ): Promise<boolean>;
  savePngToGallery(
    origin: string,
    token: string,
    id: string,
  ): Promise<boolean>;
};
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
export function serverOrigin(value: string): string {
  if (!value.trim())
    throw new Error("The app's server address has not been configured.");
  const url = new URL(value.trim());
  const local = __DEV__ && ["localhost", "127.0.0.1"].includes(url.hostname);
  if (
    (url.protocol !== "https:" && !(local && url.protocol === "http:")) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error("The app's server address must be a valid HTTPS origin.");
  return url.origin;
}
export async function api<T>(
  session: Session,
  path: string,
  body?: unknown,
): Promise<T> {
  try {
    const response = await device.requestJson(
      session.origin,
      path,
      session.token,
      body === undefined ? null : JSON.stringify(body),
    );
    const result = response.body;
    if (response.status < 200 || response.status >= 300 || !result?.ok)
      throw new ApiError(
        result?.error || "The server returned an unexpected response.",
        response.status,
      );
    return result.data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error(
      "Cannot reach the workspace. Check your connection and server address.",
    );
  }
}
