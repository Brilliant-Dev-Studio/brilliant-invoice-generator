"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { audit, company, run, transaction } from "@/lib/db";
import {
  overviewInputSchema,
  amountInMinorUnits,
} from "@/lib/financial-overview";
import { today } from "@/lib/money";
import type { Result } from "@/lib/types";

export async function saveFinancialOverview(input: unknown): Promise<Result> {
  const user = await requireUser(["SUPERADMIN", "COMPANY_ADMIN"]);
  const parsed = overviewInputSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: "Enter valid non-negative amounts and a whole invoice count.",
    };
  try {
    await transaction(async () => {
      await run(
        "SELECT id FROM companies WHERE id=$1 FOR UPDATE",
        user.companyId,
      );
      const previous = (await company(user.companyId)).financialOverview;
      const data = parsed.data;
      const value = {
        currencies: {
          ...previous?.currencies,
          [data.currency]: {
            revenue: amountInMinorUnits(data.revenue),
            month: today().slice(0, 7),
            outstanding: amountInMinorUnits(data.outstanding),
          },
        },
        count: data.count === "" ? undefined : Number(data.count),
      };
      await run(
        "UPDATE companies SET data=jsonb_set(data::jsonb, '{financialOverview}', $1::jsonb)::text WHERE id=$2",
        JSON.stringify(value),
        user.companyId,
      );
      await audit(user.id, "financial-overview.updated", user.companyId);
    });
    revalidatePath("/dashboard", "layout");
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "Could not save financial overview." };
  }
}
export async function resetFinancialOverview(): Promise<Result> {
  const user = await requireUser(["SUPERADMIN", "COMPANY_ADMIN"]);
  try {
    await transaction(async () => {
      await run(
        "UPDATE companies SET data=(data::jsonb - 'financialOverview')::text WHERE id=$1",
        user.companyId,
      );
      await audit(user.id, "financial-overview.reset", user.companyId);
    });
    revalidatePath("/dashboard", "layout");
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "Could not reset financial overview." };
  }
}
