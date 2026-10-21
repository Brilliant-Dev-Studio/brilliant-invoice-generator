"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Box,
  ChevronDown,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { saveInvoice } from "@/actions/invoices";
import { calculate, money, today } from "@/lib/money";
import type {
  Client,
  Company,
  Invoice,
  InvoiceInput,
  Totals,
} from "@/lib/types";
import { InvoicePreview } from "./invoice-preview";
import { InvoicePreviewStage } from "./invoice-preview-stage";
import { DEFAULT_INVOICE_DESIGN } from "@/lib/invoice-design";
import { ClientDialog } from "./client-dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { InvoiceShowcase } from "./invoice-showcase";
import "./invoice-editor.css";
import { T, useTranslations } from "@/components/language-provider";
const zero: Totals = { lines: [], subtotal: 0, discount: 0, tax: 0, total: 0 };
export function InvoiceForm({
  company,
  clients: initialClients,
  existing,
  requestId,
  initialClientId = "",
}: {
  company: Company;
  clients: Client[];
  existing?: Invoice;
  requestId: string;
  initialClientId?: string;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [draft, setData] = useState<InvoiceInput>(
    existing
      ? {
          ...existing,
          design: existing.design ?? { ...DEFAULT_INVOICE_DESIGN },
        }
      : {
          clientId: initialClientId,
          title: "",
          currency: "MMK",
          design: { ...(company.invoiceDesign ?? DEFAULT_INVOICE_DESIGN) },
          issueDate: today(),
          dueDate: today(),
          terms:
            "Payment is due by the date shown above. Thank you for your business.",
          items: [
            { id: requestId, description: "", quantity: "1", price: "0" },
          ],
          discountType: "PERCENT",
          discount: "0",
          tax: "0",
          payment: "",
        },
  );
  const data = useMemo<InvoiceInput>(
    () =>
      existing
        ? draft
        : {
            ...draft,
            design: company.invoiceDesign ?? DEFAULT_INVOICE_DESIGN,
          },
    [draft, existing, company.invoiceDesign],
  );
  const [clients, setClients] = useState(initialClients);
  const [clientOpen, setClientOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const computed = useMemo(() => {
    try {
      return { totals: calculate(data), error: "" };
    } catch (e) {
      return {
        totals: zero,
        error: e instanceof Error ? e.message : "Check amounts.",
      };
    }
  }, [data]);
  function field<K extends keyof InvoiceInput>(key: K, value: InvoiceInput[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }
  function updateItem(
    id: string,
    key: "description" | "quantity" | "price",
    value: string,
  ) {
    field(
      "items",
      data.items.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    );
  }
  async function save(issue: boolean) {
    const form = document.getElementById(
      "invoice-composer",
    ) as HTMLFormElement | null;
    if (form && !form.reportValidity()) return;
    setError("");
    setPending(true);
    try {
      const result = await saveInvoice(
        data,
        existing?.id || requestId,
        issue,
        existing?.revision,
      );
      if (result.ok) {
        router.push(`/dashboard/invoices/${result.data.id}?generated=true`);
        router.refresh();
      } else setError(result.error);
    } catch {
      setError(
        "Could not save the invoice. Your edits are still here; try again.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="invoice-editor">
      <div className="page-heading composer-heading">
        <div>
          <Link href="/dashboard/invoices" className="eyebrow breadcrumb">
            <ArrowLeft size={14} />
            <T text="BACK TO INVOICES" />
          </Link>
          <h1>
            <T text={existing ? "Edit draft" : "Create new invoice"} />
            <span className="heading-dot">.</span>
          </h1>
          <p>
            <T text="Add the details. Review the total. You're ready to send." />
          </p>
        </div>
        <Button variant="secondary" onClick={() => setPreview(true)}>
          <Box size={16} aria-hidden="true" />
          <T text="3D View" />
        </Button>
      </div>
      <div className="composer-layout">
        <div className="composer-edit-column">
          <form
            id="invoice-composer"
            onSubmit={(event) => {
              event.preventDefault();
              void save(true);
            }}
          >
            <fieldset disabled={pending} className="composer-fields">
              <section
                className="composer-section"
                aria-labelledby="details-heading"
              >
                <header className="composer-section-heading">
                  <span>01</span>
                  <div>
                    <h2 id="details-heading">
                      <T text="Client & details" />
                    </h2>
                    <p>
                      <T text="Who is this invoice for?" />
                    </p>
                  </div>
                </header>
                <div className="composer-client-label">
                  <label htmlFor="invoice-client">
                    <T text="Bill to" />
                  </label>
                  <button type="button" onClick={() => setClientOpen(true)}>
                    <Plus size={14} />
                    <T text="New client" />
                  </button>
                </div>
                <select
                  id="invoice-client"
                  required
                  value={data.clientId}
                  onChange={(event) => field("clientId", event.target.value)}
                >
                  <option value="">{t("Select a client")}</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <div className="composer-project-row">
                  <label>
                    <T text="Project / service" />
                    <Input
                      required
                      placeholder={t("e.g. Website redesign")}
                      value={data.title}
                      maxLength={250}
                      onChange={(event) => field("title", event.target.value)}
                    />
                  </label>
                  <label>
                    <T text="Currency" />
                    <select
                      value={data.currency}
                      onChange={(event) =>
                        field(
                          "currency",
                          event.target.value as InvoiceInput["currency"],
                        )
                      }
                    >
                      <option value="MMK">MMK</option>
                      <option value="USD">USD</option>
                      <option value="THB">THB</option>
                    </select>
                  </label>
                </div>
                <div className="composer-dates">
                  <label>
                    <T text="Issue date" />
                    <Input
                      required
                      type="date"
                      value={data.issueDate}
                      onChange={(event) =>
                        field("issueDate", event.target.value)
                      }
                    />
                  </label>
                  <label>
                    <T text="Due date" />
                    <Input
                      required
                      type="date"
                      min={data.issueDate}
                      value={data.dueDate}
                      onChange={(event) => field("dueDate", event.target.value)}
                    />
                  </label>
                </div>
              </section>
              <section
                className="composer-section"
                aria-labelledby="items-heading"
              >
                <header className="composer-section-heading">
                  <span>02</span>
                  <div>
                    <h2 id="items-heading">
                      <T text="Billing items" />
                    </h2>
                    <p>
                      <T text="What did you create or deliver?" />
                    </p>
                  </div>
                </header>
                {company.products?.length ? (
                  <label>
                    <T text="Add sample product" />
                    <select
                      value=""
                      disabled={data.items.length >= 100}
                      onChange={(event) => {
                        const product = company.products?.find(
                          (item) => item.id === event.target.value,
                        );
                        if (!product) return;
                        if (product.currency !== data.currency) {
                          setError(
                            t(
                              "Sample products use MMK. Change the invoice currency to MMK first.",
                            ),
                          );
                          return;
                        }
                        const item = {
                          id: crypto.randomUUID(),
                          description: product.name,
                          quantity: "1",
                          price: product.price,
                        };
                        field(
                          "items",
                          data.items.length === 1 && !data.items[0].description
                            ? [item]
                            : [...data.items, item],
                        );
                      }}
                    >
                      <option value="">{t("Choose a sample product")}</option>
                      {company.products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} —{" "}
                          {money(Number(product.price) * 100, product.currency)}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <div className="composer-items">
                  {data.items.map((item, index) => (
                    <div className="composer-item" key={item.id}>
                      <div className="composer-item-heading">
                        <span>
                          <T text="Item" /> {String(index + 1).padStart(2, "0")}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={t("Remove item {number}", {
                            number: index + 1,
                          })}
                          disabled={data.items.length === 1}
                          onClick={() =>
                            field(
                              "items",
                              data.items.filter(
                                (entry) => entry.id !== item.id,
                              ),
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                      <label>
                        <T text="Description" />
                        <Input
                          required
                          placeholder={t("Describe your product or service")}
                          value={item.description}
                          maxLength={1000}
                          onChange={(event) =>
                            updateItem(
                              item.id,
                              "description",
                              event.target.value,
                            )
                          }
                        />
                      </label>
                      <div className="composer-item-numbers">
                        <label>
                          <T text="Quantity" />
                          <Input
                            required
                            type="number"
                            min="0.001"
                            step="0.001"
                            value={item.quantity}
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                "quantity",
                                event.target.value,
                              )
                            }
                          />
                        </label>
                        <label>
                          <T text="Unit price" />
                          <Input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(event) =>
                              updateItem(item.id, "price", event.target.value)
                            }
                          />
                        </label>
                        <div className="composer-line-total">
                          <span>
                            <T text="Amount" />
                          </span>
                          <strong>
                            {computed.error
                              ? "—"
                              : money(
                                  computed.totals.lines[index] || 0,
                                  data.currency,
                                )}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  className="composer-add-item"
                  variant="ghost"
                  disabled={data.items.length >= 100}
                  onClick={() =>
                    field("items", [
                      ...data.items,
                      {
                        id: crypto.randomUUID(),
                        description: "",
                        quantity: "1",
                        price: "0",
                      },
                    ])
                  }
                >
                  <Plus size={16} />
                  <T text="Add item" />
                </Button>
              </section>
              <section
                className="composer-section"
                aria-labelledby="payment-heading"
              >
                <header className="composer-section-heading">
                  <span>03</span>
                  <div>
                    <h2 id="payment-heading">
                      <T text="Payment & notes" />
                    </h2>
                    <p>
                      <T text="Let your client know how to pay." />
                    </p>
                  </div>
                </header>
                <div className="form-stack">
                  <label>
                    <T text="Payment QR" />
                    <select
                      value={data.payment}
                      onChange={(event) =>
                        field(
                          "payment",
                          event.target.value as InvoiceInput["payment"],
                        )
                      }
                    >
                      <option value="">{t("No payment QR")}</option>
                      {(["kpay", "wavepay", "bank"] as const)
                        .filter((key) => company[key])
                        .map((key) => (
                          <option key={key} value={key}>
                            {key === "kpay"
                              ? "KPay"
                              : key === "wavepay"
                                ? "WavePay"
                                : t("Bank transfer")}
                          </option>
                        ))}
                    </select>
                  </label>
                  {data.payment && (
                    <div className="selected-payment-account">
                      {company.paymentAccounts?.[data.payment]?.name && (
                        <p>
                          <T text="Account name" />
                          <strong>
                            {company.paymentAccounts[data.payment]?.name}
                          </strong>
                        </p>
                      )}
                      {company.paymentAccounts?.[data.payment]?.number && (
                        <p>
                          <T text="Account number" />
                          <strong>
                            {company.paymentAccounts[data.payment]?.number}
                          </strong>
                        </p>
                      )}
                      <Link
                        href="/dashboard/settings"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <T text="Manage payment accounts in Settings." />
                      </Link>
                    </div>
                  )}
                  <label>
                    <T text="Payment terms" />
                    <textarea
                      rows={3}
                      maxLength={2000}
                      value={data.terms}
                      onChange={(event) => field("terms", event.target.value)}
                    />
                  </label>
                </div>
              </section>
            </fieldset>
          </form>
          <aside className="composer-summary" aria-labelledby="summary-heading">
            <div className="composer-summary-title">
              <FileText size={18} />
              <h2 id="summary-heading">
                <T text="Invoice summary" />
              </h2>
            </div>
            <p className="composer-number">
              {existing?.number || <T text="Invoice number assigned on save" />}
            </p>
            <dl className="composer-breakdown">
              <div>
                <dt>
                  <T text="Subtotal" />
                </dt>
                <dd>
                  {computed.error
                    ? "—"
                    : money(computed.totals.subtotal, data.currency)}
                </dd>
              </div>
              <div>
                <dt>
                  <T text="Discount" />
                </dt>
                <dd>
                  {computed.error
                    ? "—"
                    : `-${money(computed.totals.discount, data.currency)}`}
                </dd>
              </div>
              <div>
                <dt>
                  <T text="Tax" />
                </dt>
                <dd>
                  {computed.error
                    ? "—"
                    : money(computed.totals.tax, data.currency)}
                </dd>
              </div>
            </dl>
            <details className="composer-adjustments">
              <summary>
                <T text="Edit discount & tax" />
                <ChevronDown size={15} />
              </summary>
              <fieldset
                disabled={pending}
                className="composer-adjustment-fields"
              >
                <label>
                  <T text="Discount" />
                  <div className="joined-input">
                    <Input
                      form="invoice-composer"
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={data.discount}
                      onChange={(event) =>
                        field("discount", event.target.value)
                      }
                    />
                    <select
                      aria-label={t("Discount type")}
                      value={data.discountType}
                      onChange={(event) =>
                        field(
                          "discountType",
                          event.target.value as InvoiceInput["discountType"],
                        )
                      }
                    >
                      <option value="PERCENT">%</option>
                      <option value="FIXED">{data.currency}</option>
                    </select>
                  </div>
                </label>
                <label>
                  <T text="Tax / VAT (%)" />
                  <Input
                    form="invoice-composer"
                    required
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={data.tax}
                    onChange={(event) => field("tax", event.target.value)}
                  />
                </label>
              </fieldset>
            </details>
            <div className="composer-grand-total">
              <span>
                <T text="Total amount" />
                <small>{data.currency}</small>
              </span>
              <strong>
                {computed.error
                  ? "—"
                  : money(computed.totals.total, data.currency)}
              </strong>
            </div>
            {computed.error && (
              <p className="message error" role="alert">
                <T text={computed.error} />
              </p>
            )}
            {error && (
              <p className="message error" role="alert">
                <T text={error} />
              </p>
            )}
            <div className="composer-save-actions">
              <Button
                type="submit"
                form="invoice-composer"
                disabled={pending || !!computed.error}
              >
                {pending ? <T text="Saving..." /> : <T text="Create invoice" />}
                <ArrowUpRight size={17} />
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={pending || !!computed.error}
                onClick={() => void save(false)}
              >
                <T text="Save draft" />
              </Button>
            </div>
            <p className="composer-save-note">
              <Check size={14} />
              <T text="Review before creating. Issued invoices cannot be edited." />
            </p>
          </aside>
        </div>
        <aside
          className="composer-live-preview"
          aria-labelledby="live-preview-heading"
        >
          <header className="composer-preview-header">
            <div>
              <span className="live-dot" />
              <h2 id="live-preview-heading">
                <T text="Live preview" />
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={t("3D View")}
              onClick={() => setPreview(true)}
            >
              <Box size={17} aria-hidden="true" />
              <T text="3D View" />
            </Button>
          </header>
          <div
            className="composer-preview-scroll"
            tabIndex={0}
            role="region"
            aria-label={t("Invoice preview document")}
          >
            <div className="composer-preview-stage composer-live-stage">
              <div className="composer-paper-caption">
                <span>{existing?.number || t("Invoice preview")}</span>
                <span>A4 / 210 × 297 mm</span>
              </div>
              <InvoicePreviewStage>
                <InvoicePreview
                  data={data}
                  company={company}
                  client={clients.find((client) => client.id === data.clientId)}
                  number={existing?.number}
                  totals={computed.totals}
                />
              </InvoicePreviewStage>
            </div>
          </div>
          <footer className="composer-preview-footer">
            <Check size={14} />
            <T text="Your invoice updates as you type." />
          </footer>
        </aside>
      </div>
      <InvoiceShowcase
        open={preview}
        onClose={() => setPreview(false)}
        data={data}
        company={company}
        client={clients.find((client) => client.id === data.clientId)}
        number={existing?.number}
        totals={computed.totals}
      />
      <ClientDialog
        open={clientOpen}
        onClose={() => setClientOpen(false)}
        onCreated={(client) => {
          setClients((current) => [...current, client]);
          field("clientId", client.id);
        }}
      />
    </div>
  );
}
