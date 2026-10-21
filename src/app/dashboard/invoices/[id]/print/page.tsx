import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { invoice } from "@/lib/db";
import { InvoicePreview } from "@/components/invoice-preview";
export default async function PrintInvoice({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const data = await invoice((await params).id, user.companyId);
  if (!data) notFound();
  return (
    <div className="print-document">
      <InvoicePreview
        data={data}
        company={data.company}
        client={data.client}
        number={data.number}
        totals={data.totals}
        status={data.status}
      />
    </div>
  );
}
