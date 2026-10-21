import { timingSafeEqual } from "node:crypto";

export function authorizedCron(
  header: string | null,
  secret = process.env.CRON_SECRET,
) {
  if (!secret || secret.length < 32 || !header) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
