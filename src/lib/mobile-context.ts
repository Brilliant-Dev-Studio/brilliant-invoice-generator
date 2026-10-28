import { AsyncLocalStorage } from "node:async_hooks";
import type { User } from "./types";

// Only the authenticated mobile route establishes this server-side context.
export const mobileContext = new AsyncLocalStorage<{
  user: User;
  token: string;
}>();
