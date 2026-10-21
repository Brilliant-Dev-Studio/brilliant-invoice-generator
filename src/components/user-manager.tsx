"use client";
import { MascotWidget } from "./MascotWidget";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, ShieldCheck, KeyRound } from "lucide-react";
import {
  createAccount,
  resetPassword,
  setAccountStatus,
} from "@/actions/admin";
import type { Role, User } from "@/lib/types";
import { today } from "@/lib/money";
import { PlanFields } from "./plan-fields";
import { Dialog } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { T, useTranslations } from "@/components/language-provider";
import { TEAM_ACCOUNT_LIMIT } from "@/lib/team";
export function UserManager({
  users,
  companies,
  superadmin,
  actorId,
}: {
  users: User[];
  companies: { id: string; name: string }[];
  superadmin: boolean;
  actorId: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reset, setReset] = useState<User | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("new");
  const [selectedRole, setSelectedRole] = useState<Role>("COMPANY_ADMIN");
  const newCompany = selectedCompany === "new";
  const filtered = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
  );
  async function toggle(user: User) {
    setPending(true);
    setMessage("");
    try {
      const result = await setAccountStatus(
        user.id,
        user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
      );
      setMessage(
        result.ok
          ? "Account updated. Existing sessions were revoked."
          : result.error,
      );
      if (result.ok) router.refresh();
    } catch {
      setMessage("Could not update the account.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <div className="table-toolbar">
        <div className="search-field">
          <Search size={16} />
          <Input
            aria-label={t("Search accounts")}
            placeholder={t("Search name or email...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="heading-actions">
          {!superadmin && (
            <span className="muted small">
              {users.length} / {TEAM_ACCOUNT_LIMIT} <T text="team accounts" />
            </span>
          )}
          <Button
            disabled={
              pending || (!superadmin && users.length >= TEAM_ACCOUNT_LIMIT)
            }
            onClick={() => {
              setOpen(true);
              setError("");
              setSelectedCompany("new");
              setSelectedRole("COMPANY_ADMIN");
            }}
          >
            <Plus size={16} />{" "}
            <T text={superadmin ? "Create account" : "Create team account"} />
          </Button>
        </div>
      </div>
      {!superadmin && users.length >= TEAM_ACCOUNT_LIMIT && (
        <p className="message" role="status">
          <T text="This company already has 3 team accounts. Suspended accounts also count toward the limit." />
        </p>
      )}
      {message && (
        <p className="message" role="status">
          <T text={message} />
        </p>
      )}
      <div className="table-scroll panel table-panel">
        <table className="data-table account-table" role="table">
          <thead role="rowgroup">
            <tr role="row">
              <th role="columnheader">
                <T text="Account" />
              </th>
              <th role="columnheader">
                <T text="Company" />
              </th>
              <th role="columnheader">
                <T text="Role" />
              </th>
              <th role="columnheader">
                <T text="Status" />
              </th>
              <th role="columnheader">
                <T text="Actions" />
              </th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {filtered.map((user) => (
              <tr key={user.id} role="row">
                <td role="cell">
                  <div className="person-cell">
                    <span className="avatar">{user.name[0]}</span>
                    <span>
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </span>
                  </div>
                </td>
                <td role="cell" data-label={t("Company")}>
                  {companies.find((c) => c.id === user.companyId)?.name}
                </td>
                <td role="cell" data-label={t("Role")}>
                  <span className="role-label">
                    <ShieldCheck size={13} />
                    <T text={user.role.replaceAll("_", " ")} />
                  </span>
                </td>
                <td role="cell" data-label={t("Status")}>
                  <span
                    className={`status ${user.status === "ACTIVE" ? "paid" : "overdue"}`}
                  >
                    <T text={user.status} />
                  </span>
                </td>
                <td role="cell" data-label={t("Actions")}>
                  <div className="heading-actions">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pending || user.id === actorId}
                      onClick={() => toggle(user)}
                    >
                      {user.status === "ACTIVE" ? (
                        <T text="Suspend" />
                      ) : (
                        <T text="Activate" />
                      )}
                    </Button>
                    {superadmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("Reset password for {name}", {
                          name: user.name,
                        })}
                        onClick={() => {
                          setReset(user);
                          setError("");
                        }}
                      >
                        <KeyRound size={15} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <MascotWidget character={search ? "search" : "team"} />
            <h3>
              {search ? (
                <T text="No accounts found" />
              ) : (
                <T text="Room for your dream team." />
              )}
            </h3>
            <p>
              {search ? (
                <T text="Try a different search." />
              ) : superadmin ? (
                <T text="Create an account to welcome someone aboard." />
              ) : (
                <T text="Create an account to welcome someone aboard." />
              )}
            </p>
          </div>
        )}
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t(superadmin ? "Create an account" : "Create team account")}
      >
        <form
          className="form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            setError("");
            try {
              const result = await createAccount(new FormData(e.currentTarget));
              if (result.ok) {
                setOpen(false);
                setMessage(
                  "Account created. Share the initial password through a secure channel.",
                );
                router.refresh();
              } else setError(result.error);
            } catch {
              setError("Could not create account.");
            } finally {
              setPending(false);
            }
          }}
        >
          <label>
            <T text="Full name" />
            <Input name="name" required />
          </label>
          <div className="field-pair">
            <label>
              <T text="Email" />
              <Input name="email" type="email" required />
            </label>
            <label>
              <T text="Phone (optional)" />
              <Input name="phone" placeholder="+959123456789" />
            </label>
          </div>
          {superadmin ? (
            <>
              <label>
                <T text="Role" />
                <select
                  name="role"
                  value={selectedRole}
                  onChange={(event) =>
                    setSelectedRole(event.target.value as Role)
                  }
                >
                  <option value="STAFF">
                    <T text="Staff" />
                  </option>
                  <option value="COMPANY_ADMIN">
                    <T text="Company Admin" />
                  </option>
                  <option value="SUPERADMIN">
                    <T text="Superadmin" />
                  </option>
                </select>
              </label>
              <label>
                <T text="Company" />
                <select
                  name="companyId"
                  value={selectedCompany}
                  onChange={(event) => setSelectedCompany(event.target.value)}
                >
                  {companies.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="new">
                    <T text="+ Create new company" />
                  </option>
                </select>
              </label>
              {newCompany ? (
                <label>
                  <T text="New company name" />
                  <Input name="companyName" required />
                </label>
              ) : (
                <input type="hidden" name="companyName" value="" />
              )}
              {open && newCompany && selectedRole !== "SUPERADMIN" && (
                <PlanFields initialStart={today()} />
              )}
              {!newCompany && (
                <p className="muted small">
                  <T text="This account uses the company subscription. Manage plans and renewals in Client subscriptions." />
                </p>
              )}
            </>
          ) : (
            <>
              <input type="hidden" name="role" value="STAFF" />
              <input
                type="hidden"
                name="companyId"
                value={companies[0]?.id ?? ""}
              />
              <input type="hidden" name="companyName" value="" />
              <p className="muted small">
                <T text="This account will have staff access to your company." />
              </p>
            </>
          )}
          <label>
            <T text="Initial password" />
            <Input
              name="password"
              type="password"
              minLength={12}
              maxLength={128}
              required
              autoComplete="new-password"
            />
          </label>
          <p className="muted small">
            <T text="At least 12 characters. Deliver privately to the account owner." />
          </p>
          {error && (
            <p className="message error" role="alert">
              <T text={error} />
            </p>
          )}
          <Button disabled={pending}>
            {pending ? <T text="Creating..." /> : <T text="Create account" />}
          </Button>
        </form>
      </Dialog>
      <Dialog
        open={!!reset}
        onClose={() => setReset(null)}
        title={t("Reset password: {name}", { name: reset?.name || "" })}
      >
        <form
          className="form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!reset) return;
            setPending(true);
            setError("");
            try {
              const result = await resetPassword(
                reset.id,
                String(new FormData(e.currentTarget).get("password")),
              );
              if (result.ok) {
                setReset(null);
                setMessage(
                  "Password reset. All previous sessions have been revoked.",
                );
              } else setError(result.error);
            } catch {
              setError("Could not reset password.");
            } finally {
              setPending(false);
            }
          }}
        >
          <p className="muted">
            <T text="This signs the account out on all devices." />
          </p>
          <label>
            <T text="New password" />
            <Input
              name="password"
              type="password"
              minLength={12}
              maxLength={128}
              required
              autoComplete="new-password"
            />
          </label>
          {error && (
            <p className="message error">
              <T text={error} />
            </p>
          )}
          <Button disabled={pending}>
            {pending ? <T text="Resetting..." /> : <T text="Reset password" />}
          </Button>
        </form>
      </Dialog>
    </>
  );
}
