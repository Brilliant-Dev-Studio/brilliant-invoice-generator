import type {
  Currency,
  InvoiceInput,
  Totals,
  Invoice,
  Status,
} from "./types.ts";

function scaled(value: string, digits: number): bigint {
  if (!new RegExp(`^\\d{1,9}(\\.\\d{1,${digits}})?$`).test(value))
    throw new Error(
      `Enter a positive number with at most ${digits} decimal places.`,
    );
  const [whole, fraction = ""] = value.split(".");
  return (
    BigInt(whole) * 10n ** BigInt(digits) + BigInt(fraction.padEnd(digits, "0"))
  );
}
const round = (n: bigint, d: bigint) => (n + d / 2n) / d;
export function calculate(
  input: Pick<InvoiceInput, "items" | "discountType" | "discount" | "tax">,
): Totals {
  const lines = input.items.map((item) => {
    const quantity = scaled(item.quantity, 3);
    if (quantity <= 0n) throw new Error("Quantity must be greater than zero.");
    const amount = round(scaled(item.price, 2) * quantity, 1000n);
    if (amount > 100_000_000_000n)
      throw new Error("Line item exceeds the supported amount.");
    return amount;
  });
  const subtotal = lines.reduce((a, b) => a + b, 0n);
  const discountInput = scaled(input.discount, 2);
  const taxInput = scaled(input.tax, 2);
  if (
    taxInput > 10000n ||
    (input.discountType === "PERCENT" && discountInput > 10000n)
  )
    throw new Error("Percentages must be between 0 and 100.");
  const discount =
    input.discountType === "PERCENT"
      ? round(subtotal * discountInput, 10000n)
      : discountInput;
  if (discount > subtotal)
    throw new Error("Discount cannot exceed the subtotal.");
  const tax = round((subtotal - discount) * taxInput, 10000n);
  return {
    lines: lines.map(Number),
    subtotal: Number(subtotal),
    discount: Number(discount),
    tax: Number(tax),
    total: Number(subtotal - discount + tax),
  };
}
export function money(minor: number, currency: Currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minor / 100);
}
export function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Yangon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function statusOf(
  invoice: Pick<Invoice, "status" | "dueDate">,
  date = today(),
): Status {
  return invoice.status === "UNPAID" && invoice.dueDate < date
    ? "OVERDUE"
    : invoice.status;
}
