import { requireUser } from "@/lib/auth";
import { clients } from "@/lib/db";
import { ClientsList } from "@/components/clients-list";
export default async function Clients() {
  const user = await requireUser();
  return <ClientsList clients={await clients(user.companyId)} />;
}
