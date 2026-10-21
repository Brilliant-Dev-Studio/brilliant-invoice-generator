import { requireUser } from "@/lib/auth";
import { many, userColumns } from "@/lib/db";
import type { User } from "@/lib/types";
import Link from "next/link";
import { UserManager } from "@/components/user-manager";
import { SubscriptionManager } from "@/components/subscription-manager";
import { PlatformCharts } from "@/components/platform-charts";
import { today } from "@/lib/money";
import type { PlatformClient, Subscription } from "@/lib/plans";
import { T } from "@/components/language-provider";
export const dynamic = "force-dynamic";
export default async function Superadmin() {
  const actor = await requireUser(["SUPERADMIN"]);
  const users = await many<User>(
    `SELECT ${userColumns} FROM users ORDER BY name`,
  );
  const companies = await many<{ id: string; name: string }>(
    "SELECT id,name FROM companies ORDER BY name",
  );
  const platformClients = await many<PlatformClient>(
    "SELECT c.id,c.name,(SELECT COUNT(*)::int FROM users u WHERE u.companyId=c.id AND u.role<>'SUPERADMIN') AS accountCount FROM companies c WHERE EXISTS(SELECT 1 FROM users u WHERE u.companyId=c.id AND u.role<>'SUPERADMIN') OR EXISTS(SELECT 1 FROM company_subscriptions s WHERE s.companyId=c.id) ORDER BY c.name",
  );
  const subscriptions = await many<Subscription>(
    "SELECT id,companyId,planId,startsOn,expiresOn,priceMMK,months,bonusDays,bonusMonths FROM company_subscriptions ORDER BY startsOn",
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            <T text="THE CONTROL ROOM" />
          </span>
          <h1>
            <T text="Platform control" />
            <span className="heading-dot">.</span>
          </h1>
          <p>
            <T text="Your client companies, their plans, and every renewal in one place." />
          </p>
        </div>
        <Link className="button button-primary" href="/superadmin/clients">
          <T text="Manage client companies" />
        </Link>
      </div>
      <PlatformCharts
        companies={platformClients}
        subscriptions={subscriptions}
        date={today()}
      />
      <SubscriptionManager
        companies={platformClients}
        subscriptions={subscriptions}
        date={today()}
      />
      <div className="section-heading">
        <h2>
          <T text="Accounts & access" />
        </h2>
      </div>
      <div className="stats-grid compact-stats">
        <article className="stat-card">
          <div>
            <T text="Total accounts" />
          </div>
          <strong>{users.length}</strong>
        </article>
        <article className="stat-card">
          <div>
            <T text="Active accounts" />
          </div>
          <strong>{users.filter((u) => u.status === "ACTIVE").length}</strong>
        </article>
        <article className="stat-card">
          <div>
            <T text="Companies" />
          </div>
          <strong>{companies.length}</strong>
        </article>
      </div>
      <UserManager
        users={users}
        companies={companies}
        superadmin
        actorId={actor.id}
      />
    </>
  );
}
