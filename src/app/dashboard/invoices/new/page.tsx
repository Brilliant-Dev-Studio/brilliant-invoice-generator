import { randomUUID } from "node:crypto";
import { requireUser } from "@/lib/auth";
import { clients, company } from "@/lib/db";
import { InvoiceForm } from "@/components/invoice-form";
export default async function NewInvoice({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const user = await requireUser();
  const customers = await clients(user.companyId);
  const requested = (await searchParams).clientId;
  return (
    <InvoiceForm
      company={await company(user.companyId)}
      clients={customers}
      initialClientId={customers.find((client) => client.id === requested)?.id}
      requestId={randomUUID()}
    />
  );
}
