import { requireUser } from "@/lib/auth";
import { many, userColumns } from "@/lib/db";
import type { User } from "@/lib/types";
import { UserManager } from "@/components/user-manager";
import { T } from "@/components/language-provider";
export default async function PlatformAccounts() {
  const actor = await requireUser(["SUPERADMIN"]);
  const users = await many<User>(
    `SELECT ${userColumns} FROM users ORDER BY name`,
  );
  const companies = await many<{ id: string; name: string }>(
    "SELECT id,name FROM companies ORDER BY name",
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            <T text="PLATFORM ACCESS" />
          </span>
          <h1>
            <T text="Accounts & access" />
          </h1>
          <p>
            <T text="Create client companies and users, reset passwords, and manage account access across the platform." />
          </p>
        </div>
      </div>
      <UserManager
        users={users}
        companies={companies}
        superadmin
        actorId={actor.id}
      />
    </>
  );
}
