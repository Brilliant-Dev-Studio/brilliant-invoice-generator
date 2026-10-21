import { closeDb, clients, company, invoices } from "../src/lib/db.ts";
import { ensureDemo } from "../src/lib/demo.ts";
import { DEMO_COMPANY_ID, DEMO_EMAIL } from "../src/lib/demo-config.ts";

try {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--reset")) {
    console.error("Usage: npm run db:seed:demo -- [--reset]");
    process.exitCode = 1;
  } else {
    const seeded = await ensureDemo(args.includes("--reset"));
    const workspace = await company(DEMO_COMPANY_ID);
    const customers = await clients(DEMO_COMPANY_ID);
    const documents = await invoices(DEMO_COMPANY_ID);
    console.log(
      seeded
        ? "Demo seed restored successfully."
        : "Demo is already seeded; existing changes preserved.",
    );
    console.log(
      `${customers.length} clients, ${workspace.products?.length ?? 0} products, ${documents.length} invoices.`,
    );
    console.log(`Sign in using Try Demo or ${DEMO_EMAIL} at /login.`);
  }
} catch (error) {
  // Avoid printing connection strings or credentials from driver errors.
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";
  const reasons: Record<string, string> = {
    ENOTFOUND: "The database hostname could not be resolved.",
    EPERM: "This environment does not permit the database connection.",
    ECONNREFUSED: "The database refused the connection.",
    "28P01": "The database rejected the configured credentials.",
    "23505":
      "A demo identifier is already in use. Check for an existing account.",
  };
  console.error(
    `Demo seeding failed. ${reasons[code] ?? "Check database connectivity and demo account availability."}`,
  );
  process.exitCode = 1;
} finally {
  await closeDb();
}
