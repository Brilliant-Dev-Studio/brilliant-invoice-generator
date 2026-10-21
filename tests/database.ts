import { randomUUID } from "node:crypto";
import { after } from "node:test";
import { Pool } from "pg";
import { closeDb } from "../src/lib/db.ts";

export async function setupDatabase() {
  const url = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  if (!url)
    throw new Error(
      "Start PostgreSQL and set TEST_DATABASE_URL or DATABASE_URL before running integration tests.",
    );
  const admin = new Pool({
    connectionString: url,
    connectionTimeoutMillis: 5000,
  });
  const schema = `test_${randomUUID().replaceAll("-", "")}`;
  await admin.query(`CREATE SCHEMA "${schema}"`);
  const isolated = new URL(url);
  isolated.searchParams.set("options", `-c search_path=${schema}`);
  process.env.DATABASE_URL = isolated.toString();
  after(async () => {
    await closeDb();
    try {
      await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    } finally {
      await admin.end();
    }
  });
}
