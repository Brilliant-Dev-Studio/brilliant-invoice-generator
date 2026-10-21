export const PLAN_IDS = [
  "MONTHLY",
  "QUARTERLY",
  "HALF_YEAR",
  "YEARLY",
] as const;
export type PlanId = (typeof PLAN_IDS)[number];
export const PLANS = {
  MONTHLY: {
    name: "1 MONTH PLAN",
    months: 1,
    priceMMK: 25000,
    bonusDays: 0,
    bonusMonths: 0,
    bonus: "-",
  },
  QUARTERLY: {
    name: "3 MONTHS PLAN",
    months: 3,
    priceMMK: 75000,
    bonusDays: 3,
    bonusMonths: 0,
    bonus: "3 DAYS FREE",
  },
  HALF_YEAR: {
    name: "6 MONTHS PLAN",
    months: 6,
    priceMMK: 150000,
    bonusDays: 7,
    bonusMonths: 0,
    bonus: "7 DAYS FREE",
  },
  YEARLY: {
    name: "1 YEAR PLAN",
    months: 12,
    priceMMK: 300000,
    bonusDays: 0,
    bonusMonths: 1,
    bonus: "1 MONTH FREE",
  },
} satisfies Record<
  PlanId,
  {
    name: string;
    months: number;
    priceMMK: number;
    bonusDays: number;
    bonusMonths: number;
    bonus: string;
  }
>;

export type Subscription = {
  id: string;
  companyId: string;
  planId: PlanId;
  startsOn: string;
  expiresOn: string;
  priceMMK: number;
  months: number;
  bonusDays: number;
  bonusMonths: number;
};
export type PlatformClient = { id: string; name: string; accountCount: number };
export type SubscriptionStatus = "ACTIVE" | "SCHEDULED" | "EXPIRED";

export function validPlanDate(value: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value < "2000-01-01" ||
    value > "9998-01-01"
  )
    return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
}

export function planTerm(planId: PlanId, startsOn: string) {
  if (!validPlanDate(startsOn))
    throw new Error("Enter a valid plan start date.");
  const plan = PLANS[planId];
  if (!plan) throw new Error("Choose a valid plan.");
  const start = new Date(`${startsOn}T00:00:00.000Z`);
  // Clamp month-end dates; a year plus its bonus is 13 calendar months.
  const month = start.getUTCMonth() + plan.months + plan.bonusMonths;
  const lastDay = new Date(
    Date.UTC(start.getUTCFullYear(), month + 1, 0),
  ).getUTCDate();
  const end = new Date(
    Date.UTC(
      start.getUTCFullYear(),
      month,
      Math.min(start.getUTCDate(), lastDay),
    ),
  );
  end.setUTCDate(end.getUTCDate() + plan.bonusDays);
  return {
    planId,
    startsOn,
    expiresOn: end.toISOString().slice(0, 10),
    priceMMK: plan.priceMMK,
    months: plan.months,
    bonusDays: plan.bonusDays,
    bonusMonths: plan.bonusMonths,
  };
}

export function subscriptionStatus(
  term: Pick<Subscription, "startsOn" | "expiresOn">,
  date: string,
): SubscriptionStatus {
  if (date < term.startsOn) return "SCHEDULED";
  return date >= term.expiresOn ? "EXPIRED" : "ACTIVE";
}

export function companyPlan(terms: Subscription[], date: string) {
  const ordered = [...terms].sort((a, b) =>
    a.startsOn.localeCompare(b.startsOn),
  );
  return (
    ordered.find((term) => subscriptionStatus(term, date) === "ACTIVE") ??
    ordered.find((term) => subscriptionStatus(term, date) === "SCHEDULED") ??
    ordered.at(-1)
  );
}

export function platformSummary(
  companies: PlatformClient[],
  terms: Subscription[],
  date: string,
) {
  const ids = new Set(companies.map((company) => company.id));
  const relevant = terms.filter((term) => ids.has(term.companyId));
  const selected = companies.map((company) =>
    companyPlan(
      relevant.filter((term) => term.companyId === company.id),
      date,
    ),
  );
  const byPlan = Object.fromEntries(
    PLAN_IDS.map((id) => [
      id,
      selected.filter((term) => term?.planId === id).length,
    ]),
  ) as Record<PlanId, number>;
  return {
    clients: companies.length,
    active: selected.filter(
      (term) => term && subscriptionStatus(term, date) === "ACTIVE",
    ).length,
    scheduled: selected.filter(
      (term) => term && subscriptionStatus(term, date) === "SCHEDULED",
    ).length,
    expired: selected.filter(
      (term) => term && subscriptionStatus(term, date) === "EXPIRED",
    ).length,
    unassigned: selected.filter((term) => !term).length,
    totalMMK: relevant.reduce((sum, term) => sum + term.priceMMK, 0),
    byPlan,
  };
}

export function mmk(value: number) {
  return `${value.toLocaleString("en-US")} MMK`;
}
