import { requireUser } from "@/lib/auth";
import { company, many, userColumns } from "@/lib/db";
import type { User } from "@/lib/types";
import { UserManager } from "@/components/user-manager";
import { T } from "@/components/language-provider";
export default async function Team() {
  const user = await requireUser(["SUPERADMIN", "COMPANY_ADMIN"]);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            <T text="BETTER TOGETHER" />
          </span>
          <h1>
            <T text="Your team" />
            <span className="heading-dot">.</span>
          </h1>
          <p>
            <T text="Create up to 3 staff accounts for your company and manage their access." />
          </p>
        </div>
      </div>
      <UserManager
        users={await many<User>(
          `SELECT ${userColumns} FROM users WHERE companyId=$1 AND role='STAFF'`,
          user.companyId,
        )}
        companies={[await company(user.companyId)]}
        superadmin={false}
        actorId={user.id}
      />
    </>
  );
}
