import { requireUser } from "@/lib/auth";
import { Shell } from "@/components/shell";
export const dynamic = "force-dynamic";
export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await requireUser(["SUPERADMIN"]);
  return (
    <Shell user={actor} companyName="San Pya Invoice · Platform owner">
      {children}
    </Shell>
  );
}
