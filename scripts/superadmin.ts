import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import {
  audit,
  closeDb,
  emptyCompany,
  many,
  one,
  run,
  transaction,
} from "../src/lib/db.ts";
import { hashPassword, verifyPassword } from "../src/lib/password.ts";
import type { User } from "../src/lib/types.ts";

const mode = process.argv[2] || "--check";
if (!["--check", "--recover"].includes(mode))
  throw new Error("Use --check or --recover.");

const email = z
  .email()
  .parse(process.env.BOOTSTRAP_EMAIL?.trim().toLowerCase());
const password = process.env.BOOTSTRAP_PASSWORD;
type Account = User & { password: string };

async function account() {
  return one<Account>("SELECT * FROM users WHERE LOWER(email)=$1", email);
}

try {
  if (mode === "--recover") {
    const validPassword = z.string().min(12).max(128).parse(password);
    const hash = hashPassword(validPassword);
    await transaction(async () => {
      const existing = await account();
      const id = existing?.id || randomUUID();
      if (existing) {
        await run(
          "UPDATE users SET role='SUPERADMIN',status='ACTIVE',password=$1,version=version+1 WHERE id=$2",
          hash,
          id,
        );
        await run("DELETE FROM sessions WHERE userId=$1", id);
      } else {
        const company = emptyCompany(
          randomUUID(),
          process.env.BOOTSTRAP_COMPANY || "Brilliant Platform",
        );
        await run(
          "INSERT INTO companies(id,name,data) VALUES($1,$2,$3)",
          company.id,
          company.name,
          JSON.stringify(company),
        );
        await run(
          "INSERT INTO users(id,companyId,name,email,password,role) VALUES($1,$2,$3,$4,$5,'SUPERADMIN')",
          id,
          company.id,
          process.env.BOOTSTRAP_NAME || "Platform Administrator",
          email,
          hash,
        );
      }
      for (const identifier of [email, existing?.phone].filter(Boolean)) {
        await run(
          "DELETE FROM attempts WHERE key=$1",
          createHash("sha256").update(identifier!).digest("hex"),
        );
      }
      await audit(id, "account.superadmin-recovered-locally", id);
      const recovered = await account();
      if (
        recovered?.role !== "SUPERADMIN" ||
        recovered.status !== "ACTIVE" ||
        !verifyPassword(validPassword, recovered.password)
      )
        throw new Error("Recovery verification failed; changes rolled back.");
    });
    console.log(`Superadmin access restored for ${email}.`);
    console.log("Password: the BOOTSTRAP_PASSWORD value in .env.local.");
    console.log(
      "Old sessions were revoked. Sign in again at /login, then open /superadmin.",
    );
  } else {
    const configured = await account();
    console.log(`Configured account: ${email}`);
    if (!configured) {
      console.log("This account does not exist in the configured database.");
    } else {
      console.log(`Role: ${configured.role}; status: ${configured.status}`);
      console.log(
        password
          ? `Password matches .env.local: ${verifyPassword(password, configured.password) ? "yes" : "no"}`
          : "BOOTSTRAP_PASSWORD is not configured; password was not checked.",
      );
    }
    const admins = await many<Pick<User, "email" | "status">>(
      "SELECT email,status FROM users WHERE role='SUPERADMIN' ORDER BY email",
    );
    console.log("Platform Superadmins:");
    for (const admin of admins)
      console.log(`  ${admin.email} (${admin.status})`);
    if (!admins.length) console.log("  None found.");
    if (configured?.role !== "SUPERADMIN" || configured.status !== "ACTIVE")
      console.log(
        "Run npm run admin:recover to restore the configured account.",
      );
  }
} catch (error) {
  if (
    error instanceof Error &&
    "code" in error &&
    ["EPERM", "EACCES", "ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT"].includes(
      String(error.code),
    )
  ) {
    console.error(
      `Cannot reach PostgreSQL (${error.code}). Run this command in your local terminal with Docker running.`,
    );
  } else {
    console.error(
      error instanceof Error ? error.message : "Account operation failed.",
    );
  }
  process.exitCode = 1;
} finally {
  await closeDb();
}
