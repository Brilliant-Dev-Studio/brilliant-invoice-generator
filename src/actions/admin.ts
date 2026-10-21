"use server";
import { isDemoCompany } from "@/lib/demo-config";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { audit, emptyCompany, getUser, one, run, transaction } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { errorMessage, passwordSchema, text } from "@/lib/validation";
import type { Result } from "@/lib/types";
import { PLAN_IDS, validPlanDate } from "@/lib/plans";
import { recordSubscription } from "@/lib/subscriptions";
import { assertTeamCapacity } from "@/lib/team";
export async function createAccount(form: FormData): Promise<Result> {
  const actor = await requireUser(["SUPERADMIN", "COMPANY_ADMIN"]);
  try {
    if (actor.isDemo)
      throw new Error(
        "Account administration is unavailable in the public demo.",
      );
    const schema = z.object({
      name: text.min(1),
      email: z.email().transform((v) => v.toLowerCase()),
      phone: z.union([z.literal(""), z.string().regex(/^\+?[0-9]{7,15}$/)]),
      role: z.enum(["SUPERADMIN", "COMPANY_ADMIN", "STAFF"]),
      companyId: z.string(),
      companyName: text,
      password: passwordSchema,
    });
    const data = schema.parse({
      ...Object.fromEntries(form),
      ...(actor.role === "COMPANY_ADMIN"
        ? { role: "STAFF", companyId: actor.companyId, companyName: "" }
        : {}),
    });
    const subscription =
      data.companyId === "new" && data.role !== "SUPERADMIN"
        ? z
            .object({
              planId: z.enum(PLAN_IDS),
              startsOn: z
                .string()
                .refine(validPlanDate, "Enter a valid plan start date."),
            })
            .parse(Object.fromEntries(form))
        : null;
    const password = hashPassword(data.password);
    await transaction(async () => {
      let companyId = data.companyId;
      if (isDemoCompany(companyId))
        throw new Error("The demo workspace uses one shared account.");
      if (companyId === "new") {
        if (!data.companyName) throw new Error("Enter the new company's name.");
        const c = emptyCompany(randomUUID(), data.companyName);
        companyId = c.id;
        await run(
          "INSERT INTO companies(id,name,data) VALUES($1,$2,$3)",
          c.id,
          c.name,
          JSON.stringify(c),
        );
      }
      if (!(await one("SELECT id FROM companies WHERE id=$1", companyId)))
        throw new Error("Select a valid company.");
      if (data.role === "STAFF") {
        const total = await one<{ count: number }>(
          "SELECT COUNT(*)::int AS count FROM users WHERE companyId=$1 AND role='STAFF'",
          companyId,
        );
        assertTeamCapacity(total?.count ?? 0);
      }
      const id = randomUUID();
      await run(
        "INSERT INTO users(id,companyId,name,email,phone,password,role) VALUES($1,$2,$3,$4,$5,$6,$7)",
        id,
        companyId,
        data.name,
        data.email,
        data.phone || null,
        password,
        data.role,
      );
      await audit(actor.id, "account.created", id);
      if (subscription)
        await recordSubscription(
          companyId,
          subscription.planId,
          subscription.startsOn,
          actor.id,
        );
    });
    revalidatePath("/superadmin");
    revalidatePath("/dashboard/team");
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function assignCompanyPlan(form: FormData): Promise<Result> {
  const actor = await requireUser(["SUPERADMIN"]);
  try {
    if (actor.isDemo)
      throw new Error(
        "Account administration is unavailable in the public demo.",
      );
    const data = z
      .object({
        companyId: z.string().min(1),
        planId: z.enum(PLAN_IDS),
        startsOn: z
          .string()
          .refine(validPlanDate, "Enter a valid plan start date."),
      })
      .parse(Object.fromEntries(form));
    await transaction(async () => {
      const client = await one(
        "SELECT c.id FROM companies c WHERE c.id=$1 AND (EXISTS(SELECT 1 FROM users u WHERE u.companyId=c.id AND u.role<>'SUPERADMIN') OR EXISTS(SELECT 1 FROM company_subscriptions s WHERE s.companyId=c.id))",
        data.companyId,
      );
      if (!client)
        throw new Error(
          "Choose a client company. Platform-only workspaces do not need a plan.",
        );
      await recordSubscription(
        data.companyId,
        data.planId,
        data.startsOn,
        actor.id,
      );
    });
    revalidatePath("/superadmin");
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
export async function setAccountStatus(
  id: string,
  status: "ACTIVE" | "SUSPENDED",
): Promise<Result> {
  const actor = await requireUser(["SUPERADMIN", "COMPANY_ADMIN"]);
  try {
    if (actor.isDemo)
      throw new Error(
        "Account administration is unavailable in the public demo.",
      );
    z.enum(["ACTIVE", "SUSPENDED"]).parse(status);
    await transaction(async () => {
      const target = await getUser(id);
      if (
        !target ||
        (actor.role !== "SUPERADMIN" &&
          (target.companyId !== actor.companyId || target.role !== "STAFF"))
      )
        throw new Error("You cannot manage this account.");
      if (target.id === actor.id)
        throw new Error("You cannot suspend your own account.");
      if (target.role === "SUPERADMIN" && status === "SUSPENDED") {
        const count = (await one<{ count: number }>(
          "SELECT COUNT(*)::int AS count FROM users WHERE role='SUPERADMIN' AND status='ACTIVE'",
        ))!;
        if (count.count <= 1)
          throw new Error("The last active Superadmin cannot be suspended.");
      }
      await run(
        "UPDATE users SET status=$1,version=version+1 WHERE id=$2",
        status,
        id,
      );
      await run("DELETE FROM sessions WHERE userId=$1", id);
      await audit(actor.id, `account.${status.toLowerCase()}`, id);
    });
    revalidatePath("/superadmin");
    revalidatePath("/dashboard/team");
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
export async function resetPassword(
  id: string,
  password: string,
): Promise<Result> {
  const actor = await requireUser(["SUPERADMIN"]);
  try {
    if (actor.isDemo)
      throw new Error(
        "Account administration is unavailable in the public demo.",
      );
    passwordSchema.parse(password);
    if (!(await getUser(id))) throw new Error("Account not found.");
    const hash = hashPassword(password);
    await transaction(async () => {
      await run(
        "UPDATE users SET password=$1,version=version+1 WHERE id=$2",
        hash,
        id,
      );
      await run("DELETE FROM sessions WHERE userId=$1", id);
      await audit(actor.id, "account.password-reset", id);
    });
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
