import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { many } from "@/lib/db";
import { today } from "@/lib/money";
import type { Subscription } from "@/lib/plans";
import {
  PlatformCompanies,
  type CompanyRow,
} from "@/components/platform-companies";
import { T } from "@/components/language-provider";
export default async function PlatformClients() {
  await requireUser(["SUPERADMIN"]);
  const companies =
    await many<CompanyRow>(`SELECT c.id,c.name,c.status,c.data::jsonb->>'email' AS email,
    (SELECT COUNT(*)::int FROM users u WHERE u.companyId=c.id AND u.role<>'SUPERADMIN') AS accounts,
    (SELECT COUNT(*)::int FROM clients x WHERE x.companyId=c.id) AS customers,
    (SELECT COUNT(*)::int FROM invoices i WHERE i.companyId=c.id) AS invoices
    FROM companies c WHERE EXISTS(SELECT 1 FROM users u WHERE u.companyId=c.id AND u.role<>'SUPERADMIN') OR EXISTS(SELECT 1 FROM company_subscriptions s WHERE s.companyId=c.id) ORDER BY c.name`);
  const subscriptions = await many<Subscription>(
    "SELECT id,companyId,planId,startsOn,expiresOn,priceMMK,months,bonusDays,bonusMonths FROM company_subscriptions",
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            <T text="YOUR PLATFORM CLIENTS" />
          </span>
          <h1>
            <T text="Client companies" />
          </h1>
          <p>
            <T text="Manage company profiles, access, subscriptions, users, and business activity." />
          </p>
        </div>
        <Link className="button button-primary" href="/superadmin/accounts">
          <T text="Create client account" />
        </Link>
      </div>
      <PlatformCompanies
        companies={companies}
        subscriptions={subscriptions}
        date={today()}
      />
    </>
  );
}
