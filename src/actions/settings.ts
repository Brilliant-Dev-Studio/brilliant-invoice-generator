"use server";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { audit, company, one, run } from "@/lib/db";
import { putImage } from "@/lib/storage";
import {
  errorMessage,
  text,
  invoiceDesignSchema,
  paymentAccountsSchema,
} from "@/lib/validation";
import type { Company, Result } from "@/lib/types";
export async function saveInvoiceAppearance(input: unknown): Promise<Result> {
  const user = await requireUser(["SUPERADMIN", "COMPANY_ADMIN"]);
  try {
    const design = invoiceDesignSchema.parse(input);
    await run(
      "UPDATE companies SET data=jsonb_set(data::jsonb, '{invoiceDesign}', $1::jsonb)::text WHERE id=$2",
      JSON.stringify(design),
      user.companyId,
    );
    await audit(user.id, "company.updated", user.companyId);
    revalidatePath("/dashboard", "layout");
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function saveCompany(input: unknown): Promise<Result> {
  const user = await requireUser(["SUPERADMIN", "COMPANY_ADMIN"]);
  try {
    const asset = z.union([z.uuid(), z.literal("")]);
    const data = z
      .object({
        name: text.min(1),
        address: z.string().trim().max(1000),
        phone: text,
        email: z.union([z.email(), z.literal("")]),
        taxId: text,
        logo: asset,
        signature: asset,
        kpay: asset,
        wavepay: asset,
        bank: asset,
        paymentAccounts: paymentAccountsSchema.optional(),
        invoiceDesign: invoiceDesignSchema.optional(),
      })
      .parse(input);
    for (const purpose of [
      "logo",
      "signature",
      "kpay",
      "wavepay",
      "bank",
    ] as const) {
      if (
        data[purpose] &&
        !(await one(
          "SELECT id FROM assets WHERE id=$1 AND companyId=$2 AND purpose=$3",
          data[purpose],
          user.companyId,
          purpose,
        ))
      )
        throw new Error("Invalid branding asset.");
    }
    const value: Company = { ...(await company(user.companyId)), ...data };
    await run(
      "UPDATE companies SET name=$1,data=$2 WHERE id=$3",
      value.name,
      JSON.stringify(value),
      user.companyId,
    );
    await audit(user.id, "company.updated", user.companyId);
    revalidatePath("/dashboard", "layout");
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
export async function uploadAsset(form: FormData): Promise<Result<string>> {
  const user = await requireUser(["SUPERADMIN", "COMPANY_ADMIN"]);
  try {
    if (user.isDemo)
      throw new Error(
        "Image uploads are unavailable in the public demo. You can explore invoice themes and templates.",
      );
    const purpose = z
      .enum(["logo", "signature", "kpay", "wavepay", "bank"])
      .parse(form.get("purpose"));
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > 5 * 1024 * 1024
    )
      throw new Error("Choose a PNG, JPEG, or WebP image under 5 MB.");
    const source = Buffer.from(await file.arrayBuffer());
    const image = sharp(source, { limitInputPixels: 16_000_000 });
    const meta = await image.metadata();
    if (
      !meta.format ||
      !["png", "jpeg", "webp"].includes(meta.format) ||
      (meta.pages || 1) > 1
    )
      throw new Error("Use a static PNG, JPEG, or WebP image.");
    const body = await image.rotate().png().toBuffer();
    const id = randomUUID(),
      key = `companies/${user.companyId}/${purpose}/${id}.png`;
    await putImage(key, body);
    await run(
      "INSERT INTO assets(id,companyId,purpose,objectKey,mime) VALUES($1,$2,$3,$4,$5)",
      id,
      user.companyId,
      purpose,
      key,
      "image/png",
    );
    return { ok: true, data: id };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}
