"use client";
import { useState } from "react";
import { platformHistory } from "@/lib/platform-charts";
import {
  mmk,
  PLAN_IDS,
  PLANS,
  platformSummary,
  type PlatformClient,
  type Subscription,
} from "@/lib/plans";
import { T, useTranslations } from "@/components/language-provider";

export function PlatformCharts({
  companies,
  subscriptions,
  date,
}: {
  companies: PlatformClient[];
  subscriptions: Subscription[];
  date: string;
}) {
  const t = useTranslations();
  const [months, setMonths] = useState(6);
  const [selected, setSelected] = useState<string | null>(null);
  const history = platformHistory(companies, subscriptions, date, months);
  const summary = platformSummary(companies, subscriptions, date);
  const current =
    history.find((item) => item.key === selected) ?? history.at(-1)!;
  const maxValue = Math.max(1, ...history.map((item) => item.valueMMK));
  const maxClients = Math.max(1, ...history.map((item) => item.clients));
  const points = history
    .map(
      (item, i) =>
        `${30 + (i * 540) / (months - 1)},${170 - (item.clients / maxClients) * 140}`,
    )
    .join(" ");
  const statuses = [
    { label: "Active", value: summary.active, color: "var(--chart-mint)" },
    {
      label: "Scheduled",
      value: summary.scheduled,
      color: "var(--chart-blue)",
    },
    { label: "Expired", value: summary.expired, color: "var(--chart-coral)" },
    { label: "No plan", value: summary.unassigned, color: "var(--chart-gold)" },
  ];
  let offset = 0;
  const segments = statuses.map((item) => {
    const from = offset;
    offset += summary.clients ? (item.value / summary.clients) * 100 : 0;
    return `${item.color} ${from}% ${offset}%`;
  });
  return (
    <section className="platform-charts" aria-labelledby="charts-title">
      <div className="section-heading chart-heading">
        <div>
          <span className="eyebrow">
            <T text="THE BIG PICTURE" />
          </span>
          <h2 id="charts-title">
            <T text="Your platform, in numbers" />
          </h2>
        </div>
        <label className="chart-range">
          <T text="History" />
          <select
            value={months}
            onChange={(event) => setMonths(Number(event.target.value))}
          >
            <option value={6}>
              <T text="Last 6 months" />
            </option>
            <option value={12}>
              <T text="Last 12 months" />
            </option>
          </select>
        </label>
      </div>
      <div className="chart-grid">
        <article className="panel chart-card">
          <h3>
            <T text="Monthly plan value" />
          </h3>
          <p className="muted small">
            <T text="Terms starting each month, including renewals. Current month through" />{" "}
            {date}
            <T text="; future starts excluded. This is not cash collected." />
          </p>
          <div className="chart-readout" role="status">
            <strong>{mmk(current.valueMMK)}</strong>
            <span>{current.label}</span>
          </div>
          <div
            className="chart-bars"
            aria-label={t(
              "Monthly plan value; select a month for its exact value",
            )}
          >
            {history.map((item) => (
              <button
                type="button"
                key={item.key}
                className={`chart-bar-item ${current.key === item.key ? "selected" : ""}`}
                aria-label={`${item.label}: ${mmk(item.valueMMK)}`}
                aria-pressed={current.key === item.key}
                onClick={() => setSelected(item.key)}
              >
                <span className="chart-bar-track">
                  <span
                    style={{ height: `${(item.valueMMK / maxValue) * 100}%` }}
                  />
                </span>
                <span>
                  <T text={item.label} />
                </span>
              </button>
            ))}
          </div>
        </article>
        <article className="panel chart-card">
          <h3>
            <T text="Subscribed client growth" />
          </h3>
          <p className="muted small">
            <T text="Cumulative companies whose first plan has started, including now-expired clients. Renewals do not add clients." />
          </p>
          <div className="chart-readout">
            <strong>
              {history.at(-1)!.clients} <T text="companies" />
            </strong>
            <span>
              <T text="Through" /> {date}
            </span>
          </div>
          <svg
            className="client-growth-chart"
            viewBox="0 0 600 210"
            role="img"
            aria-label={`Cumulative subscribed clients: ${history.map((item) => `${item.label}: ${item.clients}`).join(", ")}`}
          >
            {[0, 0.5, 1].map((ratio) => (
              <g key={ratio}>
                <line
                  x1="30"
                  x2="570"
                  y1={170 - ratio * 140}
                  y2={170 - ratio * 140}
                  className="chart-gridline"
                />
                <text x="24" y={174 - ratio * 140} textAnchor="end">
                  {Number((maxClients * ratio).toFixed(1))}
                </text>
              </g>
            ))}
            <polygon
              points={`30,170 ${points} 570,170`}
              className="chart-area"
            />
            <polyline points={points} className="chart-line" />
            {history.map((item, i) => (
              <g key={item.key}>
                <circle
                  cx={30 + (i * 540) / (months - 1)}
                  cy={170 - (item.clients / maxClients) * 140}
                  r="4"
                  className="chart-point"
                />
                <text
                  x={30 + (i * 540) / (months - 1)}
                  y="198"
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              </g>
            ))}
          </svg>
        </article>
        <article className="panel chart-card">
          <h3>
            <T text="Subscription health" />
          </h3>
          <p className="muted small">
            <T text="Current status across" /> {summary.clients}{" "}
            <T text="client companies." />
          </p>
          <div className="chart-health">
            <div
              className="chart-donut"
              aria-hidden="true"
              style={{
                background: summary.clients
                  ? `conic-gradient(${segments.join(",")})`
                  : "var(--border)",
              }}
            >
              <span>
                <strong>{summary.clients}</strong>
                <T text="clients" />
              </span>
            </div>
            <ul className="chart-legend">
              {statuses.map((item) => (
                <li key={item.label}>
                  <span
                    className="chart-swatch"
                    style={{ background: item.color }}
                  />
                  <span>
                    <T text={item.label} />
                  </span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
          </div>
        </article>
        <article className="panel chart-card">
          <h3>
            <T text="Clients by plan" />
          </h3>
          <p className="muted small">
            <T text="Each company counts once: active plan, otherwise next scheduled or last expired plan." />
          </p>
          <div className="chart-plan-list">
            {PLAN_IDS.map((id) => (
              <div key={id}>
                <div>
                  <span>
                    <T text={PLANS[id].name} />
                  </span>
                  <strong>
                    {summary.byPlan[id]} <T text="clients" />
                  </strong>
                </div>
                <div className="chart-plan-track" aria-hidden="true">
                  <span
                    style={{
                      width: `${(summary.byPlan[id] / Math.max(1, summary.clients)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="muted small">
            {summary.unassigned} <T text="companies have no assigned plan." />
          </p>
        </article>
      </div>
      {!summary.clients && (
        <p className="message">
          <T text="Create your first client company to start filling these charts. No sample data is shown." />
        </p>
      )}
      <details className="chart-data">
        <summary>
          <T text="View monthly chart data" />
        </summary>
        <div className="table-scroll">
          <table>
            <caption>
              <T text="Historical totals through" /> {date}
            </caption>
            <thead>
              <tr>
                <th>
                  <T text="Month" />
                </th>
                <th>
                  <T text="Plan value (MMK)" />
                </th>
                <th>
                  <T text="Cumulative subscribed companies" />
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.key}>
                  <td>{item.label}</td>
                  <td>{mmk(item.valueMMK)}</td>
                  <td>{item.clients}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
