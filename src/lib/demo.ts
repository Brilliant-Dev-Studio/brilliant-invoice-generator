import { randomUUID } from "node:crypto";
import { emptyCompany, one, run, transaction } from "./db.ts";
import { calculate, today } from "./money.ts";
import { hashPassword } from "./password.ts";
import {
  DEMO_COMPANY_ID,
  DEMO_USER_ID,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_RESET_INTERVAL,
} from "./demo-config.ts";
import type { Client, Invoice } from "./types.ts";

export function demoSeed(date = today()) {
  const brand = {
    ...emptyCompany(DEMO_COMPANY_ID, "San Pya Creative Studio"),
    address: "Sample studio, Yangon, Myanmar",
    email: DEMO_EMAIL,
    products: [
      {
        id: "brand-kit",
        name: "Brand identity kit",
        price: "350000",
        currency: "MMK" as const,
      },
      {
        id: "website",
        name: "Website design",
        price: "850000",
        currency: "MMK" as const,
      },
      {
        id: "print-pack",
        name: "Business card pack",
        price: "45000",
        currency: "MMK" as const,
      },
    ],
  };
  const customers: Client[] = [
    "Golden Lotus Cafe",
    "Mingalar Boutique",
    "Riverlight Studio",
  ].map((name, i) => ({
    id: randomUUID(),
    companyId: brand.id,
    name,
    email: `sample${i + 1}@example.com`,
    address: "Sample address, Yangon",
    phone: "",
  }));
  const shift = (days: number) => {
    const value = new Date(`${date}T12:00:00Z`);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
  };
  const invoices: Invoice[] = (
    ["PAID", "UNPAID", "DRAFT", "UNPAID"] as const
  ).map((status, i) => {
    const product = brand.products[i % brand.products.length];
    const input = {
      clientId: customers[i % customers.length].id,
      title: product.name,
      currency: product.currency,
      issueDate: shift(-10),
      dueDate: shift(i === 3 ? -2 : 14),
      terms: "Sample invoice for demonstration only. No payment is required.",
      items: [
        {
          id: randomUUID(),
          description: product.name,
          quantity: "1",
          price: product.price,
        },
      ],
      discountType: "PERCENT" as const,
      discount: "0",
      tax: "0",
      payment: "" as const,
    };
    return {
      ...input,
      id: randomUUID(),
      companyId: brand.id,
      number: `INV-${date.slice(0, 4)}-${String(i + 1).padStart(4, "0")}`,
      status,
      company: brand,
      client: customers[i % customers.length],
      createdAt: `${input.issueDate}T06:00:00.000Z`,
      paidAt: status === "PAID" ? `${date}T06:00:00.000Z` : null,
      revision: 1,
      totals: calculate(input),
    };
  });
  return { brand, customers, invoices };
}

// The shared transaction lock serializes provisioning/reset with invoice writes.
export async function ensureDemo(forceReset = false, now = Date.now()) {
  return transaction(async () => {
    const reset = await one<{ value: string }>(
      "SELECT value FROM demo_resets WHERE companyId=$1",
      DEMO_COMPANY_ID,
    );
    if (!forceReset && reset && now - Number(reset.value) < DEMO_RESET_INTERVAL)
      return false;
    const existing = await one<{ id: string; companyId: string }>(
      "SELECT id,companyId FROM users WHERE LOWER(email)=$1",
      DEMO_EMAIL,
    );
    if (
      existing &&
      (existing.id !== DEMO_USER_ID || existing.companyId !== DEMO_COMPANY_ID)
    )
      throw new Error("The demo email is already assigned to another account.");
    const seed = demoSeed();
    await run(
      "INSERT INTO companies(id,name,data) VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET name=excluded.name,data=excluded.data,status='ACTIVE'",
      DEMO_COMPANY_ID,
      seed.brand.name,
      JSON.stringify(seed.brand),
    );
    await run(
      "INSERT INTO users(id,companyId,name,email,password,role) VALUES($1,$2,$3,$4,$5,'COMPANY_ADMIN') ON CONFLICT(id) DO UPDATE SET name=excluded.name,email=excluded.email,password=excluded.password,role='COMPANY_ADMIN',status='ACTIVE',phone=NULL",
      DEMO_USER_ID,
      DEMO_COMPANY_ID,
      "Demo Explorer",
      DEMO_EMAIL,
      hashPassword(DEMO_PASSWORD),
    );
    await run("DELETE FROM invoices WHERE companyId=$1", DEMO_COMPANY_ID);
    await run("DELETE FROM clients WHERE companyId=$1", DEMO_COMPANY_ID);
    await run("DELETE FROM counters WHERE companyId=$1", DEMO_COMPANY_ID);
    for (const client of seed.customers)
      await run(
        "INSERT INTO clients(id,companyId,data) VALUES($1,$2,$3)",
        client.id,
        DEMO_COMPANY_ID,
        JSON.stringify(client),
      );
    for (const invoice of seed.invoices)
      await run(
        "INSERT INTO invoices(id,companyId,number,data) VALUES($1,$2,$3,$4)",
        invoice.id,
        DEMO_COMPANY_ID,
        invoice.number,
        JSON.stringify(invoice),
      );
    await run(
      "INSERT INTO counters(companyId,year,value) VALUES($1,$2,$3)",
      DEMO_COMPANY_ID,
      today().slice(0, 4),
      seed.invoices.length,
    );
    await run("DELETE FROM audit WHERE actorId=$1", DEMO_USER_ID);
    await run(
      "INSERT INTO demo_resets(companyId,value) VALUES($1,$2) ON CONFLICT(companyId) DO UPDATE SET value=excluded.value",
      DEMO_COMPANY_ID,
      now,
    );
    return true;
  });
}
