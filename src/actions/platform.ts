"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { audit, company, one, run, transaction } from "@/lib/db";
import { errorMessage, text } from "@/lib/validation";
import type { Result } from "@/lib/types";

export async function updatePlatformCompany(form: FormData): Promise<Result> {
  const actor = await requireUser(["SUPERADMIN"]);
  try {
    const { id, ...changes } = z
      .object({
        id: z.string().min(1),
        name: text.min(1),
        email: z.union([z.email(), z.literal("")]),
        phone: text,
        address: z.string().trim().max(1000),
        taxId: text,
      })
      .parse(Object.fromEntries(form));
    await transaction(async () => {
      const value = { ...(await company(id)), ...changes };
      await run(
        "UPDATE companies SET name=$1,data=$2 WHERE id=$3",
        value.name,
        JSON.stringify(value),
        id,
      );
      await audit(actor.id, "platform.company.updated", id);
    });
    revalidatePath("/superadmin", "layout");
    revalidatePath("/dashboard", "layout");
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function setCompanyStatus(
  id: string,
  status: "ACTIVE" | "SUSPENDED",
): Promise<Result> {
  const actor = await requireUser(["SUPERADMIN"]);
  try {
    z.enum(["ACTIVE", "SUSPENDED"]).parse(status);
    await transaction(async () => {
      if (!(await one("SELECT id FROM companies WHERE id=$1", id)))
        throw new Error("Company not found.");
      if (
        status === "SUSPENDED" &&
        (await one(
          "SELECT id FROM users WHERE companyId=$1 AND role='SUPERADMIN'",
          id,
        ))
      )
        throw new Error(
          "Workspaces containing platform owners cannot be suspended.",
        );
      await run("UPDATE companies SET status=$1 WHERE id=$2", status, id);
      if (status === "SUSPENDED") {
        await run(
          "DELETE FROM sessions WHERE userId IN (SELECT id FROM users WHERE companyId=$1 AND role<>'SUPERADMIN')",
          id,
        );
      }
      await audit(actor.id, `platform.company.${status.toLowerCase()}`, id);
    });
    revalidatePath("/superadmin", "layout");
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
