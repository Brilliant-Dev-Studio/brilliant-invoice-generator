import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { company } from "@/lib/db";
import { today } from "@/lib/money";
import { T } from "@/components/language-provider";
import { FinancialOverviewForm } from "@/components/financial-overview-form";

export default async function FinancialOverviewSettings() {
  const user = await requireUser(["SUPERADMIN", "COMPANY_ADMIN"]);
  const data = await company(user.companyId);
  return (
    <>
      <div className="page-heading">
        <div>
          <Link className="text-link" href="/dashboard/settings">
            <T text="Back to settings" />
          </Link>
          <h1>
            <T text="Edit financial overview" />
          </h1>
          <p>
            <T text="Adjust dashboard totals. Your invoices and charts stay unchanged." />
          </p>
        </div>
      </div>
      <FinancialOverviewForm
        initial={data.financialOverview}
        month={today().slice(0, 7)}
      />
    </>
  );
}
