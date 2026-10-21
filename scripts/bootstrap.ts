import { randomUUID } from "node:crypto";
import { closeDb, one, emptyCompany, run, transaction } from "../src/lib/db.ts";
import { hashPassword } from "../src/lib/password.ts";
const email = process.env.BOOTSTRAP_EMAIL?.trim().toLowerCase();
const password = process.env.BOOTSTRAP_PASSWORD;
if (
  !email ||
  !email.includes("@") ||
  !password ||
  password.length < 12 ||
  password.length > 128
)
  throw new Error(
    "Supply BOOTSTRAP_EMAIL and BOOTSTRAP_PASSWORD (12-128 characters) in .env.local.",
  );
try {
  await transaction(async () => {
    if (await one("SELECT id FROM users WHERE role='SUPERADMIN'"))
      throw new Error(
        "A Superadmin already exists. Use account management instead.",
      );
    const c = emptyCompany(
      randomUUID(),
      process.env.BOOTSTRAP_COMPANY || "My company",
    );
    await run(
      "INSERT INTO companies(id,name,data) VALUES($1,$2,$3)",
      c.id,
      c.name,
      JSON.stringify(c),
    );
    await run(
      "INSERT INTO users(id,companyId,name,email,password,role) VALUES($1,$2,$3,$4,$5,$6)",
      randomUUID(),
      c.id,
      process.env.BOOTSTRAP_NAME || "Administrator",
      email,
      hashPassword(password),
      "SUPERADMIN",
    );
  });
  console.log("Superadmin created. Sign in at /login.");
} finally {
  await closeDb();
}
