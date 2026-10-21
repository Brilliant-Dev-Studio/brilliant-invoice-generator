import { DemoWatermark } from "@/components/demo-watermark";
import { T } from "@/components/language-provider";
import { requireUser } from "@/lib/auth";
import { company } from "@/lib/db";
import { Shell } from "@/components/shell";
export const dynamic = "force-dynamic";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <>
      {user.isDemo && <DemoWatermark print />}
      <Shell user={user} companyName={(await company(user.companyId)).name}>
        {user.isDemo && (
          <div className="demo-notice no-print">
            <T text="Demo workspace · Shared sample data · Resets daily · Exports are watermarked" />
          </div>
        )}
        {children}
      </Shell>
    </>
  );
}
