import type { PlatformClient, Subscription } from "./plans.ts";

export function platformHistory(
  companies: PlatformClient[],
  terms: Subscription[],
  date: string,
  months: number,
) {
  const ids = new Set(companies.map((company) => company.id));
  const relevant = terms.filter((term) => ids.has(term.companyId));
  const firstStart = new Map<string, string>();
  for (const term of relevant) {
    const previous = firstStart.get(term.companyId);
    if (!previous || term.startsOn < previous)
      firstStart.set(term.companyId, term.startsOn);
  }
  const [year, month] = date.split("-").map(Number);
  return Array.from({ length: months }, (_, index) => {
    const start = new Date(Date.UTC(year, month - months + index, 1));
    const key = start.toISOString().slice(0, 7);
    const next = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1),
    )
      .toISOString()
      .slice(0, 10);
    const eligible = relevant.filter(
      (term) => term.startsOn.slice(0, 7) === key && term.startsOn <= date,
    );
    return {
      key,
      label: start.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }),
      valueMMK: eligible.reduce((sum, term) => sum + term.priceMMK, 0),
      clients: [...firstStart.values()].filter(
        (day) => day < next && day <= date,
      ).length,
    };
  });
}
