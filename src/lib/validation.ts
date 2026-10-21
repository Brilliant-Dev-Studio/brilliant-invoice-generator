import { z } from "zod";
import {
  DEFAULT_INVOICE_DESIGN,
  INVOICE_TEMPLATES,
  INVOICE_THEMES,
} from "./invoice-design.ts";
export const invoiceDesignSchema = z.object({
  template: z.enum(INVOICE_TEMPLATES),
  theme: z.enum(INVOICE_THEMES),
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid six-digit color."),
});
export const text = z.string().trim().max(250);
const paymentAccountSchema = z.object({
  name: text,
  number: z.string().trim().max(100),
});
export const paymentAccountsSchema = z.object({
  kpay: paymentAccountSchema.optional(),
  wavepay: paymentAccountSchema.optional(),
  bank: paymentAccountSchema.optional(),
});
const decimal = z
  .string()
  .regex(/^\d{1,9}(\.\d{1,3})?$/, "Enter a valid amount.");
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !Number.isNaN(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v,
    "Invalid date.",
  );
export const clientSchema = z.object({
  name: text.min(1),
  email: z.union([z.email(), z.literal("")]),
  phone: text,
  address: z.string().trim().max(1000),
});
export const invoiceSchema = z
  .object({
    design: invoiceDesignSchema.default(DEFAULT_INVOICE_DESIGN),
    clientId: z.uuid(),
    title: text.min(1),
    currency: z.enum(["MMK", "USD", "THB"]),
    issueDate: date,
    dueDate: date,
    terms: z.string().trim().max(2000),
    payment: z.enum(["", "kpay", "wavepay", "bank"]),
    discountType: z.enum(["PERCENT", "FIXED"]),
    discount: decimal,
    tax: decimal,
    items: z
      .array(
        z.object({
          id: z.uuid(),
          description: z.string().trim().min(1).max(1000),
          quantity: decimal,
          price: decimal,
        }),
      )
      .min(1)
      .max(100),
  })
  .refine(
    (v) => v.dueDate >= v.issueDate,
    "Due date must be on or after the issue date.",
  );
export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(128);
export function errorMessage(error: unknown) {
  if (error instanceof z.ZodError)
    return error.issues[0]?.message || "Check the form fields.";
  if (error instanceof Error && "code" in error && error.code === "23505")
    return "That email or phone is already in use.";
  if (
    error instanceof Error &&
    !("code" in error) &&
    !/postgres|database|ENOENT|AWS|credential/i.test(error.message)
  )
    return error.message;
  console.error(
    "Operation failed",
    error instanceof Error ? error.name : "Unknown error",
  );
  return "This operation could not be completed. Please try again.";
}
