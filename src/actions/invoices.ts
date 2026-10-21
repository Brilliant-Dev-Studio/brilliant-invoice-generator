"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  audit,
  clients,
  company,
  invoice,
  one,
  run,
  transaction,
} from "@/lib/db";
import { calculate, today } from "@/lib/money";
import { clientSchema, errorMessage, invoiceSchema } from "@/lib/validation";
import type { Client, Invoice, Result } from "@/lib/types";
export async function createClient(input: unknown): Promise<Result<Client>> {
  const user = await requireUser();
  try {
    const data = clientSchema.parse(input);
    const client = { ...data, id: randomUUID(), companyId: user.companyId };
    await run(
      "INSERT INTO clients(id,companyId,data) VALUES($1,$2,$3)",
      client.id,
      user.companyId,
      JSON.stringify(client),
    );
    revalidatePath("/dashboard/clients");
    return { ok: true, data: client };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
export async function saveInvoice(
  input: unknown,
  requestId: string,
  issue: boolean,
  revision?: number,
): Promise<Result<{ id: string }>> {
  const user = await requireUser();
  try {
    if (!/^[\da-f-]{36}$/i.test(requestId))
      throw new Error("Invalid invoice identifier.");
    const data = invoiceSchema.parse(input);
    await transaction(async () => {
      const client = (await clients(user.companyId)).find(
        (c) => c.id === data.clientId,
      );
      if (!client)
        throw new Error("Select a client belonging to your company.");
      const brand = await company(user.companyId);
      if (data.payment && !brand[data.payment])
        throw new Error(
          "Upload the selected payment QR in company settings first.",
        );
      const totals = calculate(data);
      const existing = await invoice(requestId, user.companyId);
      if (existing && existing.status !== "DRAFT")
        throw new Error("Issued invoices cannot be edited.");
      if (existing && existing.revision !== revision)
        throw new Error(
          "This invoice changed in another tab. Reload before saving.",
        );
      let number = existing?.number;
      if (!number) {
        const year = today().slice(0, 4);
        const counter = (await one<{ value: number }>(
          "INSERT INTO counters(companyId,year,value) VALUES($1,$2,1) ON CONFLICT(companyId,year) DO UPDATE SET value=counters.value+1 RETURNING value",
          user.companyId,
          year,
        ))!;
        number = `INV-${year}-${String(counter.value).padStart(4, "0")}`;
      }
      const value: Invoice = {
        ...data,
        id: requestId,
        companyId: user.companyId,
        number,
        status: issue ? "UNPAID" : "DRAFT",
        company: brand,
        client,
        totals,
        createdAt: existing?.createdAt || new Date().toISOString(),
        paidAt: null,
        revision: (existing?.revision || 0) + 1,
      };
      const saved = await run(
        "INSERT INTO invoices(id,companyId,number,data) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET data=excluded.data WHERE invoices.companyId=excluded.companyId",
        requestId,
        user.companyId,
        number,
        JSON.stringify(value),
      );
      if (saved.changes !== 1) throw new Error("Invoice could not be saved.");
      await audit(
        user.id,
        issue ? "invoice.issued" : "invoice.draft-saved",
        requestId,
      );
    });
    revalidatePath("/dashboard", "layout");
    return { ok: true, data: { id: requestId } };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
export async function markPaid(id: string): Promise<Result> {
  const user = await requireUser(["SUPERADMIN", "COMPANY_ADMIN"]);
  try {
    await transaction(async () => {
      const current = await invoice(id, user.companyId);
      if (!current || current.status === "DRAFT")
        throw new Error("Only issued invoices can be marked paid.");
      if (current.status === "PAID") return;
      current.status = "PAID";
      current.paidAt = new Date().toISOString();
      current.revision++;
      await run(
        "UPDATE invoices SET data=$1 WHERE id=$2 AND companyId=$3",
        JSON.stringify(current),
        id,
        user.companyId,
      );
      await audit(user.id, "invoice.paid", id);
    });
    revalidatePath("/dashboard", "layout");
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
