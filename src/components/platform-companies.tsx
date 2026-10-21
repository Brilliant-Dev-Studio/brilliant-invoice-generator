"use client";
import { useState } from "react";
import Link from "next/link";
import { Input } from "./ui/input";
import {
  companyPlan,
  subscriptionStatus,
  PLANS,
  mmk,
  type Subscription,
} from "@/lib/plans";
import { T, useTranslations } from "@/components/language-provider";
export type CompanyRow = {
  id: string;
  name: string;
  status: string;
  email: string;
  accounts: number;
  customers: number;
  invoices: number;
};
export function PlatformCompanies({
  companies,
  subscriptions,
  date,
}: {
  companies: CompanyRow[];
  subscriptions: Subscription[];
  date: string;
}) {
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const rows = companies.filter(
    (c) =>
      `${c.name} ${c.email}`.toLowerCase().includes(search.toLowerCase()) &&
      (status === "ALL" || c.status === status),
  );
  return (
    <>
      <div className="table-toolbar">
        <Input
          aria-label={t("Search companies")}
          placeholder={t("Search company or contact email...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label={t("Company access status")}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">
            <T text="All company access" />
          </option>
          <option value="ACTIVE">
            <T text="Active access" />
          </option>
          <option value="SUSPENDED">
            <T text="Suspended access" />
          </option>
        </select>
      </div>
      <p className="muted small">
        {rows.length}{" "}
        <T text="client companies. Customers are the buyers saved inside each company." />
      </p>
      <div
        className="panel table-scroll"
        tabIndex={0}
        role="region"
        aria-label={t("Client companies")}
      >
        <table className="account-table company-directory-table">
          <thead>
            <tr>
              <th scope="col">
                <T text="Client company" />
              </th>
              <th scope="col">
                <T text="Access" />
              </th>
              <th scope="col">
                <T text="Plan / expiry" />
              </th>
              <th scope="col">
                <T text="Accounts" />
              </th>
              <th scope="col">
                <T text="Customers" />
              </th>
              <th scope="col">
                <T text="Invoices" />
              </th>
              <th scope="col">
                <T text="Total plan value" />
              </th>
              <th scope="col">
                <T text="Manage" />
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const terms = subscriptions.filter((t) => t.companyId === c.id);
              const plan = companyPlan(terms, date);
              return (
                <tr key={c.id}>
                  <td data-label={t("Company")}>
                    <div>
                      <strong>{c.name}</strong>
                      <p className="muted small">
                        {c.email || <T text="No contact email" />}
                      </p>
                    </div>
                  </td>
                  <td data-label={t("Access")}>
                    <span
                      className={`status ${c.status === "ACTIVE" ? "paid" : "overdue"}`}
                    >
                      <T text={c.status} />
                    </span>
                  </td>
                  <td data-label={t("Plan")}>
                    <div>
                      {plan ? (
                        <T text={PLANS[plan.planId].name} />
                      ) : (
                        <T text="No plan" />
                      )}
                      {plan && (
                        <p className="muted small">
                          {subscriptionStatus(plan, date)} · {plan.expiresOn}
                        </p>
                      )}
                    </div>
                  </td>
                  <td data-label={t("Accounts")}>{c.accounts}</td>
                  <td data-label={t("Customers")}>{c.customers}</td>
                  <td data-label={t("Invoices")}>{c.invoices}</td>
                  <td data-label={t("Plan value")}>
                    {mmk(terms.reduce((n, t) => n + t.priceMMK, 0))}
                  </td>
                  <td>
                    <Link
                      className="button button-secondary"
                      href={`/superadmin/clients/${c.id}`}
                    >
                      <T text="Manage company" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length && (
          <p className="empty-state">
            <T text="No companies match. Create a client account to add a company." />
          </p>
        )}
      </div>
    </>
  );
}
