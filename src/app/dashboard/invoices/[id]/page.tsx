import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { clients, company, invoice } from "@/lib/db";
import { statusOf } from "@/lib/money";
import { InvoiceForm } from "@/components/invoice-form";
import { InvoicePreview } from "@/components/invoice-preview";
import { InvoiceActions } from "@/components/invoice-actions";
import { InvoiceGeneration } from "@/components/invoice-generation";
import { T } from "@/components/language-provider";
export default async function InvoiceDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string; generated?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const data = await invoice(id, user.companyId);
  if (!data) notFound();
  const query = await searchParams;
  if (data.status === "DRAFT" && query.edit === "true")
    return (
      <InvoiceForm
        company={await company(user.companyId)}
        clients={await clients(user.companyId)}
        existing={data}
        requestId={id}
      />
    );
  return (
    <>
      {query.generated === "true" && <InvoiceGeneration invoice={data} />}
      <div className="page-heading no-print">
        <div>
          <Link href="/dashboard/invoices" className="eyebrow breadcrumb">
            <ArrowLeft size={13} /> <T text="BACK TO INVOICES" />
          </Link>
          <h1>{data.number}</h1>
          <p>
            {data.title}{" "}
            <span className={`status ${statusOf(data).toLowerCase()}`}>
              <T text={statusOf(data)} />
            </span>
          </p>
        </div>
        <div>
          {data.status === "DRAFT" && (
            <Link href="?edit=true" className="text-link">
              <T text="Edit & issue draft" />
            </Link>
          )}
          <InvoiceActions
            id={id}
            number={data.number}
            canPay={data.status === "UNPAID" && user.role !== "STAFF"}
          />
        </div>
      </div>
      <div className="detail-paper">
        <InvoicePreview
          data={data}
          company={data.company}
          client={data.client}
          number={data.number}
          totals={data.totals}
          status={data.status}
        />
      </div>
    </>
  );
}
