import { randomUUID } from "node:crypto";
import { audit, one, run } from "./db.ts";
import { planTerm, type PlanId } from "./plans.ts";

// Call inside a transaction so concurrent renewals cannot overlap.
export async function recordSubscription(
  companyId: string,
  planId: PlanId,
  startsOn: string,
  actorId: string,
) {
  const term = planTerm(planId, startsOn);
  const latest = await one<{ expiresOn: string }>(
    "SELECT expiresOn FROM company_subscriptions WHERE companyId=$1 ORDER BY expiresOn DESC LIMIT 1",
    companyId,
  );
  if (latest && startsOn < latest.expiresOn)
    throw new Error(
      `This company already has a plan through ${latest.expiresOn}. Start the renewal on or after that date.`,
    );
  const id = randomUUID();
  await run(
    "INSERT INTO company_subscriptions(id,companyId,planId,startsOn,expiresOn,priceMMK,months,bonusDays,bonusMonths,createdBy) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
    id,
    companyId,
    planId,
    term.startsOn,
    term.expiresOn,
    term.priceMMK,
    term.months,
    term.bonusDays,
    term.bonusMonths,
    actorId,
  );
  await audit(actorId, "subscription.created", id);
}
