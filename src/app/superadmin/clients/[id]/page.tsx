import { getTranslations } from "@/lib/server-language";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { company, clients, invoices, many, one, userColumns } from "@/lib/db";
import { money, statusOf, today } from "@/lib/money";
import type { User } from "@/lib/types";
import type { Subscription } from "@/lib/plans";
import { PlatformCompanyEditor } from "@/components/platform-company-editor";
import { SubscriptionManager } from "@/components/subscription-manager";
import { UserManager } from "@/components/user-manager";
import { T } from "@/components/language-provider";
export default async function CompanyDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations();
  const actor = await requireUser(["SUPERADMIN"]);
  const { id } = await params;
  const row = await one<{ status: string }>(
    "SELECT status FROM companies WHERE id=$1",
    id,
  );
  if (!row) notFound();
  const profile = await company(id);
  const users = await many<User>(
    `SELECT ${userColumns} FROM users WHERE companyId=$1 ORDER BY name`,
    id,
  );
  const subscriptions = await many<Subscription>(
    "SELECT id,companyId,planId,startsOn,expiresOn,priceMMK,months,bonusDays,bonusMonths FROM company_subscriptions WHERE companyId=$1",
    id,
  );
  const customers = await clients(id);
  const records = await invoices(id);
  return (
    <>
      <Link href="/superadmin/clients" className="button button-secondary">
        <T text="Back to client companies" />
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            <T text="COMPANY MANAGEMENT" />
          </span>
          <h1>{profile.name}</h1>
          <p>
            {users.length} <T text="accounts ·" /> {customers.length}{" "}
            <T text="customers ·" /> {records.length} <T text="invoices" />
          </p>
        </div>
      </div>
      <PlatformCompanyEditor
        company={profile}
        status={row.status}
        hasOwner={users.some((u) => u.role === "SUPERADMIN")}
      />
      <SubscriptionManager
        companies={[
          {
            id,
            name: profile.name,
            accountCount: users.filter((u) => u.role !== "SUPERADMIN").length,
          },
        ]}
        subscriptions={subscriptions}
        date={today()}
      />
      <div className="section-heading">
        <h2>
          <T text="Company accounts" />
        </h2>
      </div>
      <UserManager
        users={users}
        companies={[{ id, name: profile.name }]}
        superadmin
        actorId={actor.id}
      />
      <div className="section-heading">
        <h2>
          <T text="Customer directory" />
        </h2>
      </div>
      <p className="muted">
        <T text="These are this company's invoice customers." />
      </p>
      <div className="panel table-scroll">
        <table className="account-table">
          <thead>
            <tr>
              <th>
                <T text="Name" />
              </th>
              <th>
                <T text="Email" />
              </th>
              <th>
                <T text="Phone" />
              </th>
              <th>
                <T text="Address" />
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td data-label={t("Name")}>{c.name}</td>
                <td data-label={t("Email")}>{c.email || "—"}</td>
                <td data-label={t("Phone")}>{c.phone || "—"}</td>
                <td data-label={t("Address")}>{c.address || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!customers.length && (
          <p className="empty-state">
            <T text="No customers yet." />
          </p>
        )}
      </div>
      <div className="section-heading">
        <h2>
          <T text="Invoice tracking" />
        </h2>
      </div>
      <div className="panel table-scroll">
        <table className="account-table">
          <thead>
            <tr>
              <th>
                <T text="Invoice" />
              </th>
              <th>
                <T text="Customer" />
              </th>
              <th>
                <T text="Status" />
              </th>
              <th>
                <T text="Issued" />
              </th>
              <th>
                <T text="Due" />
              </th>
              <th>
                <T text="Total" />
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((i) => (
              <tr key={i.id}>
                <td data-label={t("Invoice")}>{i.number}</td>
                <td data-label={t("Customer")}>{i.client.name}</td>
                <td data-label={t("Status")}>
                  <T text={statusOf(i)} />
                </td>
                <td data-label={t("Issued")}>{i.issueDate}</td>
                <td data-label={t("Due")}>{i.dueDate}</td>
                <td data-label={t("Total")}>
                  {money(i.totals.total, i.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!records.length && (
          <p className="empty-state">
            <T text="No invoices yet." />
          </p>
        )}
      </div>
    </>
  );
}
