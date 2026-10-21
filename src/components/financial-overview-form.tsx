"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveFinancialOverview,
  resetFinancialOverview,
} from "@/actions/financial-overview";
import type { OverviewSettings } from "@/lib/financial-overview";
import type { Currency } from "@/lib/types";
import { T, useTranslations } from "./language-provider";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function FinancialOverviewForm({
  initial,
  month,
}: {
  initial?: OverviewSettings;
  month: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [currency, setCurrency] = useState<Currency>("MMK");
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      (["MMK", "USD", "THB"] as const).map((key) => {
        const value = initial?.currencies?.[key];
        return [
          key,
          {
            revenue:
              value?.month === month && value.revenue !== undefined
                ? (value.revenue / 100).toFixed(2)
                : "",
            outstanding:
              value?.outstanding !== undefined
                ? (value.outstanding / 100).toFixed(2)
                : "",
          },
        ];
      }),
    ),
  );
  const [count, setCount] = useState(initial?.count?.toString() ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  async function submit(reset = false) {
    if (pending) return;
    setPending(true);
    setMessage("");
    try {
      const result = reset
        ? await resetFinancialOverview()
        : await saveFinancialOverview({ currency, ...values[currency], count });
      setFailed(!result.ok);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      if (reset) {
        setValues(
          Object.fromEntries(
            ["MMK", "USD", "THB"].map((key) => [
              key,
              { revenue: "", outstanding: "" },
            ]),
          ),
        );
        setCount("");
      }
      setMessage(
        reset
          ? "Invoice-calculated totals restored for all currencies."
          : "Financial overview saved.",
      );
      router.refresh();
    } catch {
      setFailed(true);
      setMessage("Could not save financial overview.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form
      className="panel"
      style={{ maxWidth: 760 }}
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <fieldset disabled={pending} style={{ border: 0, padding: 0, margin: 0 }}>
        <div className="form-stack">
          <p className="panel-description">
            <T text="Leave a field empty to calculate it from invoices. Enter 0 to display zero." />
          </p>
          <label>
            <T text="Currency" />
            <select
              value={currency}
              onChange={(event) => {
                setCurrency(event.target.value as Currency);
                setMessage("");
              }}
            >
              <option value="MMK">MMK</option>
              <option value="USD">USD</option>
              <option value="THB">THB</option>
            </select>
          </label>
          {(
            [
              ["revenue", "Monthly revenue"],
              ["outstanding", "Outstanding balance"],
            ] as const
          ).map(([key, label]) => (
            <label key={key}>
              <T text={label} /> · {currency}
              {key === "revenue" ? ` · ${month}` : ""}
              <Input
                type="number"
                min="0"
                max="999999999999.99"
                step="0.01"
                placeholder={t("Automatic from invoices")}
                value={values[currency][key]}
                onChange={(event) =>
                  setValues({
                    ...values,
                    [currency]: {
                      ...values[currency],
                      [key]: event.target.value,
                    },
                  })
                }
              />
            </label>
          ))}
          <p className="panel-description">
            <T text="Monthly revenue overrides apply only to the current month. Save each currency separately." />
          </p>
          <label>
            <T text="Invoices generated" />
            <Input
              type="number"
              min="0"
              max="999999999"
              step="1"
              placeholder={t("Automatic from invoices")}
              value={count}
              onChange={(event) => setCount(event.target.value)}
            />
          </label>
          <p className="panel-description">
            <T text="Invoice count applies across all currencies." />
          </p>
          <div className="heading-actions">
            <Button type="submit">
              <T text={pending ? "Saving..." : "Save changes"} />
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void submit(true)}
            >
              <T text="Reset to invoice totals" />
            </Button>
          </div>
          <p className="panel-description">
            <T text="Reset removes all manual totals. It does not delete invoices." />
          </p>
        </div>
      </fieldset>
      {message && (
        <p className={`message ${failed ? "error" : "success"}`} role="status">
          <T text={message} />
        </p>
      )}
    </form>
  );
}
