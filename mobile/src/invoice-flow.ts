import { calculate } from "../../src/lib/money.ts";
import type { InvoiceInput } from "../../src/lib/types.ts";

export function invoiceStepError(input: InvoiceInput, step: number): string {
  if (!input.clientId) return "Choose a client to continue.";
  if (step >= 1) {
    const validDate = (value: string) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value;
    if (!input.title.trim()) return "Give this invoice a title.";
    if (
      !validDate(input.issueDate) ||
      !validDate(input.dueDate) ||
      input.dueDate < input.issueDate
    )
      return "Enter valid dates. The due date cannot be before the issue date.";
  }
  if (step >= 2) {
    if (
      !input.items.length ||
      input.items.some((line) => !line.description.trim())
    )
      return "Add a description for each item.";
    try {
      calculate(input);
    } catch (e) {
      return (e as Error).message;
    }
  }
  return "";
}
