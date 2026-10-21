"use client";
import { useState } from "react";
import { createClient } from "@/actions/invoices";
import type { Client } from "@/lib/types";
import { Dialog } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { T, useTranslations } from "@/components/language-provider";
export function ClientDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (client: Client) => void;
}) {
  const t = useTranslations();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <Dialog open={open} onClose={onClose} title={t("Add a new client")}>
      <form
        className="form-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setError("");
          try {
            const result = await createClient(
              Object.fromEntries(new FormData(e.currentTarget)),
            );
            if (result.ok) {
              onCreated(result.data);
              onClose();
            } else setError(result.error);
          } catch {
            setError("Could not save the client. Try again.");
          } finally {
            setPending(false);
          }
        }}
      >
        <label>
          <T text="Client / business name" />
          <Input name="name" required maxLength={250} />
        </label>
        <div className="field-pair">
          <label>
            <T text="Email" />
            <Input name="email" type="email" />
          </label>
          <label>
            <T text="Phone" />
            <Input name="phone" />
          </label>
        </div>
        <label>
          <T text="Billing address" />
          <textarea name="address" rows={3} maxLength={1000} />
        </label>
        {error && (
          <p className="message error" role="alert">
            <T text={error} />
          </p>
        )}
        <Button disabled={pending}>
          {pending ? <T text="Saving..." /> : <T text="Create client" />}
        </Button>
      </form>
    </Dialog>
  );
}
