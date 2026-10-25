import { requireUser } from "@/lib/auth";
import { company } from "@/lib/db";
import { storageReady } from "@/lib/storage";
import { AppAboutPanel } from "@/components/app-version";
import { SettingsForm } from "@/components/settings-form";
import { T } from "@/components/language-provider";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
export default async function Settings() {
  const user = await requireUser(["SUPERADMIN", "COMPANY_ADMIN"]);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            <T text="MAKE IT YOURS" />
          </span>
          <h1>
            <T text="Company profile" />
            <span className="heading-dot">.</span>
          </h1>
          <p>
            <T text="Your identity, on every invoice." />
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/dashboard/settings/financial-overview">
            <SlidersHorizontal size={18} />
            <T text="Edit financial overview" />
          </Link>
        </Button>
      </div>
      <SettingsForm
        company={await company(user.companyId)}
        storageReady={storageReady()}
      />
      <AppAboutPanel />
    </>
  );
}
