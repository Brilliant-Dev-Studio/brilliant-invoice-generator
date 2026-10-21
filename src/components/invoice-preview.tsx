/* eslint-disable @next/next/no-img-element */
import { DemoWatermark } from "./demo-watermark";
import { isDemoCompany } from "@/lib/demo-config";
import { Brand } from "./brand";
import { money } from "@/lib/money";
import type { Company, Client, InvoiceInput, Totals } from "@/lib/types";
import type { CSSProperties } from "react";
import { invoiceDesignColors } from "@/lib/invoice-design";
import "./invoice-design.css";
import "./invoice-layout.css";
export function InvoicePreview({
  data,
  company,
  client,
  number = "INV-DRAFT",
  totals,
  status = "DRAFT",
}: {
  data: InvoiceInput;
  company: Company;
  client?: Client;
  number?: string;
  totals: Totals;
  status?: string;
}) {
  const colors = data.design ? invoiceDesignColors(data.design) : null;
  const paymentAccount = data.payment
    ? company.paymentAccounts?.[data.payment]
    : undefined;
  const designStyle = colors
    ? ({
        "--invoice-accent": colors.accent,
        "--invoice-on-accent": colors.onAccent,
        "--invoice-ink": colors.ink,
        "--invoice-bg": colors.background,
        "--invoice-text": colors.text,
        "--invoice-muted": colors.muted,
        "--invoice-line": colors.line,
      } as CSSProperties)
    : undefined;
  return (
    <article
      className={`invoice-paper${data.design ? " invoice-designed" : ""}`}
      data-template={data.design?.template}
      data-invoice-theme={data.design?.theme}
      style={designStyle}
      aria-label="Invoice preview"
    >
      {isDemoCompany(company.id) && <DemoWatermark />}
      <header className="invoice-hero">
        <div className="invoice-hero-top">
          {company.logo ? (
            <img
              src={`/api/assets/${company.logo}`}
              alt={`${company.name} logo`}
              className="invoice-logo"
            />
          ) : (
            <Brand compact />
          )}
          <span className="invoice-word">INVOICE</span>
        </div>
        <div className="invoice-title-row">
          <div>
            <h2>{number}</h2>
            <p>{data.title || "Your project or service"}</p>
          </div>
          <dl>
            <div>
              <dt>Issued</dt>
              <dd>{data.issueDate}</dd>
            </div>
            <div>
              <dt>Due date</dt>
              <dd>{data.dueDate}</dd>
            </div>
          </dl>
        </div>
        <div className="invoice-parties">
          <div>
            <span>FROM</span>
            <h3>{company.name}</h3>
            <p>{company.address}</p>
            <p>{company.email}</p>
            <p>{company.phone}</p>
            {company.taxId && <p>Tax ID: {company.taxId}</p>}
          </div>
          <div>
            <span>BILLED TO</span>
            <h3>{client?.name || "Select a client"}</h3>
            <p>{client?.address}</p>
            <p>{client?.email}</p>
            <p>{client?.phone}</p>
          </div>
        </div>
      </header>
      <div className="invoice-body">
        <div className="invoice-status-row">
          <span className="invoice-currency">
            All amounts in {data.currency}
          </span>
          {status === "DRAFT" && <span className="draft-watermark">DRAFT</span>}
          {status === "PAID" && <span className="paid-stamp">PAID</span>}
        </div>
        <table className="invoice-items">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={item.id}>
                <td>
                  <span className="line-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.description || "Item description"}
                </td>
                <td>{item.quantity}</td>
                <td>{money(Number(item.price || 0) * 100, data.currency)}</td>
                <td>{money(totals.lines[i] || 0, data.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="invoice-settlement">
          <div className="invoice-summary">
            <div>
              <span>Subtotal</span>
              <span>{money(totals.subtotal, data.currency)}</span>
            </div>
            <div>
              <span>
                Discount{" "}
                {data.discountType === "PERCENT" ? `(${data.discount}%)` : ""}
              </span>
              <span>-{money(totals.discount, data.currency)}</span>
            </div>
            <div>
              <span>Tax ({data.tax}%)</span>
              <span>{money(totals.tax, data.currency)}</span>
            </div>
            <div className="grand-total">
              <span>{status === "PAID" ? "Total paid" : "Total due"}</span>
              <strong>{money(totals.total, data.currency)}</strong>
            </div>
          </div>
          <div className="invoice-bottom">
            <div className="terms">
              <h4>Payment terms</h4>
              <p>{data.terms || "Thank you for your business."}</p>
              {data.payment && company[data.payment] && (
                <div className="payment-qr">
                  <img
                    src={`/api/assets/${company[data.payment]}`}
                    alt={`${data.payment} payment QR code`}
                  />
                  <span>
                    Scan to pay
                    <br />
                    <strong>
                      {data.payment === "kpay"
                        ? "KPay"
                        : data.payment === "wavepay"
                          ? "WavePay"
                          : "Bank transfer"}
                    </strong>
                  </span>
                  {(paymentAccount?.name || paymentAccount?.number) && (
                    <dl className="invoice-payment-account">
                      {paymentAccount.name && (
                        <div>
                          <dt>Account name</dt>
                          <dd>{paymentAccount.name}</dd>
                        </div>
                      )}
                      {paymentAccount.number && (
                        <div>
                          <dt>Account number</dt>
                          <dd>{paymentAccount.number}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>
              )}
            </div>
            {company.signature && (
              <div className="signature">
                <img
                  src={`/api/assets/${company.signature}?fit=ink`}
                  alt="Authorized signature"
                />
                <span>Authorized signature</span>
              </div>
            )}
          </div>
        </div>
        <footer className="invoice-footer">
          <span>Thank you for choosing {company.name}.</span>
          <span>{number}</span>
        </footer>
      </div>
    </article>
  );
}
