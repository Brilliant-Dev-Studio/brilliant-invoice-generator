"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, Plus } from "lucide-react";
import { assignCompanyPlan } from "@/actions/admin";
import {
  companyPlan,
  mmk,
  PLANS,
  subscriptionStatus,
  type PlatformClient,
  type Subscription,
} from "@/lib/plans";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog } from "./ui/dialog";
import { PlanFields } from "./plan-fields";
import { T, useTranslations } from "@/components/language-provider";

export function SubscriptionManager({
  companies,
  subscriptions,
  date,
}: {
  companies: PlatformClient[];
  subscriptions: Subscription[];
  date: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<PlatformClient | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const termsFor = (id: string) =>
    subscriptions
      .filter((term) => term.companyId === id)
      .sort((a, b) => a.startsOn.localeCompare(b.startsOn));
  const filtered = companies.filter((company) => {
    const term = companyPlan(termsFor(company.id), date);
    const status = term ? subscriptionStatus(term, date) : "NO_PLAN";
    return (
      company.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "ALL" || filter === status)
    );
  });
  const latestExpiry = selected
    ? termsFor(selected.id).at(-1)?.expiresOn
    : undefined;
  const nextStart = latestExpiry && latestExpiry > date ? latestExpiry : date;
  return (
    <section
      className="subscriptions-section"
      aria-labelledby="subscriptions-heading"
    >
      <div className="section-heading">
        <h2 id="subscriptions-heading">
          <T text="Client subscriptions" />
        </h2>
        <span className="muted small">
          {filtered.length} <T text="companies" />
        </span>
      </div>
      <div className="table-toolbar">
        <div className="search-field">
          <Search size={16} />
          <Input
            aria-label={t("Search client companies")}
            placeholder={t("Search company...")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <label className="subscription-filter">
          <span className="sr-only">
            <T text="Filter subscriptions" />
          </span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="ALL">
              <T text="All subscriptions" />
            </option>
            <option value="ACTIVE">
              <T text="Active" />
            </option>
            <option value="SCHEDULED">
              <T text="Scheduled" />
            </option>
            <option value="EXPIRED">
              <T text="Expired" />
            </option>
            <option value="NO_PLAN">
              <T text="No plan" />
            </option>
          </select>
        </label>
      </div>
      {message && (
        <p className="message success" role="status">
          <T text={message} />
        </p>
      )}
      <div className="subscription-grid">
        {filtered.map((company) => {
          const terms = termsFor(company.id);
          const term = companyPlan(terms, date);
          const status = term ? subscriptionStatus(term, date) : "NO_PLAN";
          const next =
            term && subscriptionStatus(term, date) === "ACTIVE"
              ? terms.find((item) => item.startsOn >= term.expiresOn)
              : undefined;
          return (
            <article className="panel subscription-card" key={company.id}>
              <div className="subscription-card-heading">
                <span className="section-icon">
                  <Building2 size={19} />
                </span>
                <div>
                  <h3>{company.name}</h3>
                  <p className="muted small">
                    {company.accountCount} <T text="client accounts" />
                  </p>
                </div>
                <span
                  className={`status ${status === "ACTIVE" ? "paid" : status === "EXPIRED" ? "overdue" : "draft"}`}
                >
                  <T text={status.replaceAll("_", " ")} />
                </span>
              </div>
              <dl className="plan-preview">
                <div>
                  <dt>
                    <T text="Plan" />
                  </dt>
                  <dd>
                    {term ? (
                      <T text={PLANS[term.planId].name} />
                    ) : (
                      <T text="Not assigned" />
                    )}
                  </dd>
                </div>
                <div>
                  <dt>
                    <T text="Start date" />
                  </dt>
                  <dd>{term?.startsOn || "—"}</dd>
                </div>
                <div>
                  <dt>
                    <T text="Expires (00:00 Yangon)" />
                  </dt>
                  <dd>{term?.expiresOn || "—"}</dd>
                </div>
                <div>
                  <dt>
                    <T text="Term price" />
                  </dt>
                  <dd>{term ? mmk(term.priceMMK) : "—"}</dd>
                </div>
                <div>
                  <dt>
                    <T text="Company total" />
                  </dt>
                  <dd>
                    {mmk(
                      terms.reduce((total, item) => total + item.priceMMK, 0),
                    )}
                  </dd>
                </div>
              </dl>
              {next && (
                <p className="message">
                  <T text="Next:" /> <T text={PLANS[next.planId].name} />{" "}
                  <T text="starts" /> {next.startsOn}.
                </p>
              )}
              <Button
                variant="secondary"
                onClick={() => {
                  setSelected(company);
                  setError("");
                }}
              >
                <Plus size={16} />
                {terms.length ? (
                  <T text="Add renewal" />
                ) : (
                  <T text="Assign plan" />
                )}
              </Button>
              {terms.length > 0 && (
                <details className="subscription-history">
                  <summary>
                    <T text="Plan history (" />
                    {terms.length})
                  </summary>
                  <ol>
                    {[...terms].reverse().map((item) => (
                      <li key={item.id}>
                        <strong>
                          <T text={PLANS[item.planId].name} /> ·{" "}
                          {mmk(item.priceMMK)}
                        </strong>
                        <span>
                          {item.startsOn} → {item.expiresOn}
                        </span>
                        <span>
                          {item.months} <T text="paid months" />
                          {item.bonusMonths ? (
                            <T
                              text=" + {count} bonus month"
                              values={{ count: item.bonusMonths }}
                            />
                          ) : (
                            ""
                          )}
                          {item.bonusDays ? (
                            <T
                              text=" + {count} bonus days"
                              values={{ count: item.bonusDays }}
                            />
                          ) : (
                            ""
                          )}{" "}
                          · {subscriptionStatus(item, date).toLowerCase()}
                        </span>
                      </li>
                    ))}
                  </ol>
                </details>
              )}
            </article>
          );
        })}
      </div>
      {!filtered.length && (
        <div className="panel empty-state">
          <Building2 size={28} />
          <h3>
            {companies.length ? (
              <T text="No matching companies" />
            ) : (
              <T text="Your first client starts here" />
            )}
          </h3>
          <p>
            {companies.length ? (
              <T text="Try another search or subscription status." />
            ) : (
              <T text="Use Create account below, select a new company, and choose its plan." />
            )}
          </p>
        </div>
      )}
      <Dialog
        open={selected !== null}
        onClose={() => {
          if (!pending) setSelected(null);
        }}
        title={
          selected
            ? t("Plan for {name}", { name: selected.name })
            : t("Company plan")
        }
      >
        {selected && (
          <form
            className="form-stack"
            onSubmit={async (event) => {
              event.preventDefault();
              setPending(true);
              setError("");
              try {
                const result = await assignCompanyPlan(
                  new FormData(event.currentTarget),
                );
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                setMessage(
                  t("Plan recorded for {name}.", { name: selected.name }),
                );
                setSelected(null);
                router.refresh();
              } catch {
                setError("Could not record the plan. Please try again.");
              } finally {
                setPending(false);
              }
            }}
          >
            <input type="hidden" name="companyId" value={selected.id} />
            <PlanFields
              key={selected.id}
              initialStart={nextStart}
              minStart={latestExpiry}
            />
            {latestExpiry && (
              <p className="muted small">
                <T text="Existing coverage ends on" /> {latestExpiry}
                <T text=". The new term is added to history; it does not replace the current plan." />
              </p>
            )}
            {error && (
              <p className="message error" role="alert">
                <T text={error} />
              </p>
            )}
            <Button disabled={pending}>
              {pending ? (
                <T text="Saving..." />
              ) : (
                <T text="Save company plan" />
              )}
            </Button>
          </form>
        )}
      </Dialog>
    </section>
  );
}
