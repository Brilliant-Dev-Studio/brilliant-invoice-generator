"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Company } from "@/lib/types";
import { updatePlatformCompany, setCompanyStatus } from "@/actions/platform";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { T, useTranslations } from "@/components/language-provider";
export function PlatformCompanyEditor({
  company,
  status,
  hasOwner,
}: {
  company: Company;
  status: string;
  hasOwner: boolean;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  return (
    <section className="panel platform-editor">
      <div className="section-heading">
        <h2>
          <T text="Company profile & access" />
        </h2>
        <span className={`status ${status === "ACTIVE" ? "paid" : "overdue"}`}>
          <T text={status} />
        </span>
      </div>
      <form
        className="form-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          setPending(true);
          setMessage("");
          try {
            const result = await updatePlatformCompany(form);
            setMessage(result.ok ? "Company profile saved." : result.error);
            if (result.ok) router.refresh();
          } catch {
            setMessage("Could not save company.");
          } finally {
            setPending(false);
          }
        }}
      >
        <input type="hidden" name="id" value={company.id} />
        <div className="platform-profile-fields">
          {(
            [
              ["name", "Company name"],
              ["email", "Contact email"],
              ["phone", "Phone"],
              ["address", "Address"],
              ["taxId", "Tax ID"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              <T text={label} />
              <Input
                name={key}
                defaultValue={company[key]}
                type={key === "email" ? "email" : "text"}
                required={key === "name"}
              />
            </label>
          ))}
        </div>
        <Button disabled={pending}>
          <T text="Save company profile" />
        </Button>
      </form>
      <p className="muted small">
        <T text="Suspension blocks company-admin and staff access. Reactivation preserves any individually suspended accounts." />
      </p>
      <Button
        variant="secondary"
        disabled={pending || hasOwner}
        onClick={() => {
          setMessage("");
          setConfirm(true);
        }}
      >
        {status === "ACTIVE" ? (
          <T text="Suspend company" />
        ) : (
          <T text="Reactivate company" />
        )}
      </Button>
      {hasOwner && (
        <p className="muted small">
          <T text="This company contains a platform owner and cannot be suspended." />
        </p>
      )}
      {message && (
        <p className="message" role="status">
          <T text={message} />
        </p>
      )}
      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t(
          status === "ACTIVE" ? "Suspend {name}?" : "Reactivate {name}?",
          { name: company.name },
        )}
      >
        {message && (
          <p className="message" role="status">
            <T text={message} />
          </p>
        )}
        <p>
          {status === "ACTIVE" ? (
            <T text="Company users will be signed out and blocked from access. Their records will be preserved." />
          ) : (
            <T text="Company users with active accounts will be able to sign in again." />
          )}
        </p>
        <Button
          disabled={pending}
          onClick={async () => {
            setPending(true);
            setMessage("");
            try {
              const result = await setCompanyStatus(
                company.id,
                status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
              );
              setMessage(result.ok ? "Company access updated." : result.error);
              if (result.ok) {
                setConfirm(false);
                router.refresh();
              }
            } catch {
              setMessage("Could not update access.");
            } finally {
              setPending(false);
            }
          }}
        >
          <T text="Confirm" />{" "}
          {status === "ACTIVE" ? (
            <T text="suspension" />
          ) : (
            <T text="reactivation" />
          )}
        </Button>
      </Dialog>
    </section>
  );
}
