import { AsyncLocalStorage } from "node:async_hooks";
import { Pool, type PoolClient } from "pg";
import type { Company, Client, Invoice, User } from "./types.ts";

let pool: Pool | undefined;
let initialized: Promise<void> | undefined;
const currentTransaction = new AsyncLocalStorage<PoolClient>();

function connection() {
  if (!pool) {
    if (!process.env.DATABASE_URL)
      throw new Error("Configure DATABASE_URL for PostgreSQL.");
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      connectionTimeoutMillis: 5000,
    });
    pool.on("error", (error) =>
      console.error("PostgreSQL connection error", error.message),
    );
  }
  return pool;
}

async function initialize() {
  const client = await connection().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(7284101)");
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, name TEXT NOT NULL, data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, companyId TEXT NOT NULL REFERENCES companies(id), name TEXT NOT NULL,
        email TEXT NOT NULL, phone TEXT UNIQUE, password TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('SUPERADMIN','COMPANY_ADMIN','STAFF')),
        status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','SUSPENDED')), version INTEGER NOT NULL DEFAULT 1);
      CREATE UNIQUE INDEX IF NOT EXISTS users_email ON users (LOWER(email));
      CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, userId TEXT NOT NULL REFERENCES users(id), expires BIGINT NOT NULL);
      CREATE TABLE IF NOT EXISTS clients (id TEXT PRIMARY KEY, companyId TEXT NOT NULL REFERENCES companies(id), data TEXT NOT NULL, sequence BIGSERIAL);
      CREATE TABLE IF NOT EXISTS counters (companyId TEXT NOT NULL REFERENCES companies(id), year TEXT NOT NULL, value INTEGER NOT NULL, PRIMARY KEY(companyId,year));
      CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY, companyId TEXT NOT NULL REFERENCES companies(id), number TEXT NOT NULL, data TEXT NOT NULL, sequence BIGSERIAL, UNIQUE(companyId,number));
      CREATE TABLE IF NOT EXISTS assets (id TEXT PRIMARY KEY, companyId TEXT NOT NULL REFERENCES companies(id), purpose TEXT NOT NULL, objectKey TEXT NOT NULL, mime TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires BIGINT NOT NULL);
      CREATE TABLE IF NOT EXISTS audit (id BIGSERIAL PRIMARY KEY, actorId TEXT NOT NULL, action TEXT NOT NULL, targetId TEXT NOT NULL, createdAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
      CREATE INDEX IF NOT EXISTS invoices_company ON invoices(companyId);
      CREATE INDEX IF NOT EXISTS clients_company ON clients(companyId);
      INSERT INTO migrations(version) VALUES(1) ON CONFLICT DO NOTHING;
      CREATE TABLE IF NOT EXISTS company_subscriptions (
        id TEXT PRIMARY KEY,
        companyId TEXT NOT NULL REFERENCES companies(id),
        planId TEXT NOT NULL CHECK(planId IN ('MONTHLY','QUARTERLY','HALF_YEAR','YEARLY')),
        startsOn TEXT NOT NULL CHECK(startsOn ~ '^\\d{4}-\\d{2}-\\d{2}$'),
        expiresOn TEXT NOT NULL CHECK(expiresOn > startsOn),
        priceMMK INTEGER NOT NULL CHECK(priceMMK >= 0),
        months INTEGER NOT NULL CHECK(months > 0),
        bonusDays INTEGER NOT NULL CHECK(bonusDays >= 0),
        bonusMonths INTEGER NOT NULL CHECK(bonusMonths >= 0),
        createdBy TEXT NOT NULL REFERENCES users(id),
        createdAt TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(companyId,startsOn)
      );
      CREATE INDEX IF NOT EXISTS subscriptions_company ON company_subscriptions(companyId,expiresOn);
      INSERT INTO migrations(version) VALUES(2) ON CONFLICT DO NOTHING;
      ALTER TABLE companies ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','SUSPENDED'));
      INSERT INTO migrations(version) VALUES(3) ON CONFLICT DO NOTHING;
      CREATE TABLE IF NOT EXISTS demo_resets (companyId TEXT PRIMARY KEY REFERENCES companies(id), value BIGINT NOT NULL);
    `);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function ready() {
  initialized ??= initialize().catch((error) => {
    initialized = undefined;
    throw error;
  });
  await initialized;
}

// PostgreSQL folds unquoted column names to lowercase; preserve the domain types.
const columnNames: Record<string, string> = {
  companyid: "companyId",
  userid: "userId",
  objectkey: "objectKey",
  actorid: "actorId",
  targetid: "targetId",
  createdat: "createdAt",
  planid: "planId",
  startson: "startsOn",
  expireson: "expiresOn",
  pricemmk: "priceMMK",
  bonusdays: "bonusDays",
  bonusmonths: "bonusMonths",
  accountcount: "accountCount",
};
type Parameter = string | number | boolean | null;
async function query(sql: string, args: Parameter[]) {
  await ready();
  return (currentTransaction.getStore() ?? connection()).query(sql, args);
}
export async function many<T>(sql: string, ...args: Parameter[]): Promise<T[]> {
  const result = await query(sql, args);
  return result.rows.map(
    (row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          columnNames[key] ?? key,
          value,
        ]),
      ) as T,
  );
}
export async function one<T>(
  sql: string,
  ...args: Parameter[]
): Promise<T | undefined> {
  return (await many<T>(sql, ...args))[0];
}
export async function run(sql: string, ...args: Parameter[]) {
  const result = await query(sql, args);
  return { changes: result.rowCount ?? 0 };
}
export async function transaction<T>(fn: () => Promise<T>): Promise<T> {
  if (currentTransaction.getStore())
    throw new Error("Nested transactions are not supported.");
  await ready();
  const client = await connection().connect();
  try {
    await client.query("BEGIN");
    // Preserve serialized read/check/write operations across concurrent requests.
    await client.query("SELECT pg_advisory_xact_lock(7284102)");
    const result = await currentTransaction.run(client, fn);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
export async function closeDb() {
  await pool?.end();
  pool = undefined;
  initialized = undefined;
}
export const userColumns =
  "id, companyId, name, email, phone, role, status, version";
export function getUser(id: string) {
  return one<User>(`SELECT ${userColumns} FROM users WHERE id=$1`, id);
}
export async function company(id: string): Promise<Company> {
  const row = await one<{ data: string }>(
    "SELECT data FROM companies WHERE id=$1",
    id,
  );
  if (!row) throw new Error("Company not found.");
  return JSON.parse(row.data);
}
export async function clients(companyId: string): Promise<Client[]> {
  return (
    await many<{ data: string }>(
      "SELECT data FROM clients WHERE companyId=$1 ORDER BY sequence DESC",
      companyId,
    )
  ).map((r) => JSON.parse(r.data));
}
export async function invoices(companyId: string): Promise<Invoice[]> {
  return (
    await many<{ data: string }>(
      "SELECT data FROM invoices WHERE companyId=$1 ORDER BY sequence DESC",
      companyId,
    )
  ).map((r) => JSON.parse(r.data));
}
export async function invoice(
  id: string,
  companyId: string,
): Promise<Invoice | undefined> {
  const row = await one<{ data: string }>(
    "SELECT data FROM invoices WHERE id=$1 AND companyId=$2",
    id,
    companyId,
  );
  return row ? JSON.parse(row.data) : undefined;
}
export function audit(actorId: string, action: string, targetId: string) {
  return run(
    "INSERT INTO audit(actorId,action,targetId) VALUES($1,$2,$3)",
    actorId,
    action,
    targetId,
  );
}
export function emptyCompany(id: string, name: string): Company {
  return {
    id,
    name,
    address: "",
    phone: "",
    email: "",
    taxId: "",
    logo: "",
    signature: "",
    kpay: "",
    wavepay: "",
    bank: "",
  };
}
