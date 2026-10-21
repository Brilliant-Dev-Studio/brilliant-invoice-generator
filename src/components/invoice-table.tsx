import Link from "next/link";
import { ArrowUpRight, Check, Clock3, FilePenLine, X } from "lucide-react";
import { money, statusOf } from "@/lib/money";
import type { Invoice } from "@/lib/types";
import { Button } from "./ui/button";
import { MascotWidget } from "./MascotWidget";
import { T } from "@/components/language-provider";
import styles from "./invoice-table.module.css";

function InvoiceIcon({ invoice }: { invoice: Invoice }) {
  const status = statusOf(invoice).toLowerCase();
  const Badge =
    status === "paid"
      ? Check
      : status === "draft"
        ? FilePenLine
        : status === "void"
          ? X
          : Clock3;
  return (
    <span className={styles.icon} data-status={status} aria-hidden="true">
      <span className={styles.paper}>
        <span className={styles.fold} />
        <span className={styles.heading} />
        <span className={styles.line} />
        <span className={styles.line} />
        <span className={styles.total} />
      </span>
      <span className={styles.badge}>
        <Badge size={14} strokeWidth={2.8} />
      </span>
    </span>
  );
}
export function InvoiceTable({
  invoices,
  filtered = false,
}: {
  invoices: Invoice[];
  filtered?: boolean;
}) {
  if (!invoices.length)
    return (
      <div className="empty-state">
        <MascotWidget character={filtered ? "search" : "invoice"} />
        <h3>
          {filtered ? (
            <T text="No matches, but keep looking." />
          ) : (
            <T text="Big ideas start with a little paper." />
          )}
        </h3>
        <p>
          {filtered ? (
            <T text="Try another search or view all your invoices." />
          ) : (
            <T text="Your invoice buddy is ready. Let's create your first invoice." />
          )}
        </p>
        <Button asChild>
          <Link
            href={filtered ? "/dashboard/invoices" : "/dashboard/invoices/new"}
          >
            {filtered ? (
              <T text="View all invoices" />
            ) : (
              <T text="Create an invoice" />
            )}{" "}
            <ArrowUpRight size={16} />
          </Link>
        </Button>
      </div>
    );
  return (
    <>
      <ul className="invoice-card-list" aria-label="Invoices">
        {invoices.map((invoice) => (
          <li key={invoice.id}>
            <Link
              className="invoice-mobile-card"
              href={`/dashboard/invoices/${invoice.id}`}
            >
              <div className="invoice-card-top">
                <InvoiceIcon invoice={invoice} />
                <span className="invoice-card-heading">
                  <strong>{invoice.client.name}</strong>
                  <span>{invoice.number}</span>
                </span>
                <ArrowUpRight size={20} />
              </div>
              <p>{invoice.title}</p>
              <div className="invoice-card-bottom">
                <span className={`status ${statusOf(invoice).toLowerCase()}`}>
                  <T text={statusOf(invoice)} />
                </span>
                <strong>
                  {money(invoice.totals.total, invoice.currency)}{" "}
                  <small>{invoice.currency}</small>
                </strong>
              </div>
              <span className="invoice-card-due">
                <T text="Due" /> {invoice.dueDate}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="table-scroll invoice-desktop-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <T text="Invoice / project" />
              </th>
              <th>
                <T text="Client" />
              </th>
              <th>
                <T text="Due date" />
              </th>
              <th>
                <T text="Status" />
              </th>
              <th className="text-right">
                <T text="Amount" />
              </th>
              <th>
                <span className="sr-only">
                  <T text="Open" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>
                  <Link
                    className={`invoice-link ${styles.link}`}
                    href={`/dashboard/invoices/${invoice.id}`}
                  >
                    <InvoiceIcon invoice={invoice} />
                    <span className={styles.label}>
                      <strong>{invoice.number}</strong>
                      <small>{invoice.title}</small>
                    </span>
                  </Link>
                </td>
                <td>{invoice.client.name}</td>
                <td>{invoice.dueDate}</td>
                <td>
                  <span className={`status ${statusOf(invoice).toLowerCase()}`}>
                    <T text={statusOf(invoice)} />
                  </span>
                </td>
                <td className="text-right amount-cell">
                  {money(invoice.totals.total, invoice.currency)}
                  <small>{invoice.currency}</small>
                </td>
                <td>
                  <Link
                    href={`/dashboard/invoices/${invoice.id}`}
                    className="icon-button"
                    aria-label={`Open ${invoice.number}`}
                  >
                    <ArrowUpRight size={17} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
