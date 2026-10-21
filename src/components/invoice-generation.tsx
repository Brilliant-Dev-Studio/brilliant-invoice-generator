"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, RotateCcw, X } from "lucide-react";
import { money } from "@/lib/money";
import type { Invoice } from "@/lib/types";
import styles from "./invoice-generation.module.css";
import { T, useTranslations } from "@/components/language-provider";
import { MascotWidget } from "./MascotWidget";

export function InvoiceGeneration({ invoice }: { invoice: Invoice }) {
  const t = useTranslations();
  const dialog = useRef<HTMLDialogElement>(null);
  const [replay, setReplay] = useState(0);
  const [closed, setClosed] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const machine = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 0.5, height: 800 });

  useEffect(() => {
    if (closed) return;
    const element = dialog.current;
    element?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [closed]);

  useEffect(() => {
    if (closed || !stage.current || !machine.current) return;
    const observer = new ResizeObserver(() => {
      if (!stage.current || !machine.current) return;
      const height = machine.current.offsetHeight;
      if (!height) return;
      setFit({
        height,
        scale: Math.max(
          0.01,
          Math.min(
            1,
            (stage.current.clientWidth - 32) / 480,
            (stage.current.clientHeight - 16) / height,
          ),
        ),
      });
    });
    observer.observe(stage.current);
    observer.observe(machine.current);
    return () => observer.disconnect();
  }, [closed, replay]);

  function close() {
    dialog.current?.close();
    setClosed(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("generated");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="generation-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <button
        className={styles.close}
        onClick={close}
        aria-label={t("Close invoice animation")}
        autoFocus
      >
        <X size={20} />
      </button>
      <div className={styles.mascot}>
        <MascotWidget context="success" compact />
      </div>
      <div className={styles.intro}>
        <span>
          <T text="FROM GREAT WORK TO" />
        </span>
        <h2 id="generation-title">
          <T text="A little paper magic." />
        </h2>
        <p>
          <T text="Your invoice, fresh off the press." />
        </p>
      </div>
      <div className={styles.stage} ref={stage}>
        <div style={{ width: 480 * fit.scale, height: fit.height * fit.scale }}>
          <div
            className={styles.machine}
            key={replay}
            ref={machine}
            style={{ transform: `scale(${fit.scale})` }}
          >
            <div className={styles.printer} aria-hidden="true">
              <span>SAN PYA / INVOICE STUDIO</span>
              <i />
            </div>
            <div className={styles.feed}>
              <article
                className={styles.receipt}
                aria-label={t("Created invoice summary")}
              >
                <header>
                  <strong>{invoice.company.name}</strong>
                  <span>
                    <T text="INVOICE /" /> {invoice.number}
                  </span>
                </header>
                <div className={styles.client}>
                  <T text="BILL TO" /> <strong>{invoice.client.name}</strong>
                </div>
                <div className={styles.amount}>
                  {money(invoice.totals.total, invoice.currency)}
                </div>
                <div className={styles.meta}>
                  {invoice.issueDate}{" "}
                  <span className={styles.stamp}>
                    {invoice.status === "DRAFT" ? (
                      <T text="DRAFT" />
                    ) : invoice.status === "PAID" ? (
                      <T text="PAID" />
                    ) : (
                      <T text="ISSUED" />
                    )}
                  </span>
                </div>
                <div className={styles.items}>
                  {invoice.items.slice(0, 5).map((item, index) => (
                    <div className={styles.row} key={item.id}>
                      <span>
                        {item.quantity} x {item.description}
                      </span>
                      <strong>
                        {money(invoice.totals.lines[index], invoice.currency)}
                      </strong>
                    </div>
                  ))}
                  {invoice.items.length > 5 && (
                    <p>
                      + {invoice.items.length - 5}{" "}
                      <T text="more items on your full invoice" />
                    </p>
                  )}
                </div>
                <div className={styles.totals}>
                  <div className={styles.row}>
                    <span>
                      <T text="Subtotal" />
                    </span>
                    <span>
                      {money(invoice.totals.subtotal, invoice.currency)}
                    </span>
                  </div>
                  <div className={styles.row}>
                    <span>
                      <T text="Discount" />
                    </span>
                    <span>
                      -{money(invoice.totals.discount, invoice.currency)}
                    </span>
                  </div>
                  <div className={styles.row}>
                    <span>
                      <T text="Tax (" />
                      {invoice.tax}%)
                    </span>
                    <span>{money(invoice.totals.tax, invoice.currency)}</span>
                  </div>
                  <div className={`${styles.row} ${styles.total}`}>
                    <strong>
                      <T text="TOTAL" />
                    </strong>
                    <strong>
                      {money(invoice.totals.total, invoice.currency)}
                    </strong>
                  </div>
                </div>
                <footer>
                  <T text="THANK YOU FOR YOUR BUSINESS" />
                  <span>
                    <T text="Due" /> {invoice.dueDate}
                  </span>
                  <div className={styles.barcode} aria-hidden="true" />
                  <span>{invoice.number}</span>
                </footer>
              </article>
            </div>
          </div>
        </div>
      </div>
      <footer className={styles.completion}>
        <div className={styles.success} role="status">
          <Check size={18} />
          <strong>
            <T
              text={
                invoice.status === "DRAFT"
                  ? "Invoice saved successfully"
                  : "Invoice created successfully"
              }
            />
          </strong>
        </div>
        <p className={styles.note}>
          <T text="Saved and ready to share with your client." />
        </p>
        <div className={styles.actions}>
          <button onClick={() => setReplay((value) => value + 1)}>
            <RotateCcw size={16} /> <T text="Replay" />
          </button>
          <button onClick={close}>
            <T text="View invoice" /> <ArrowUpRight size={17} />
          </button>
        </div>
      </footer>
    </dialog>
  );
}
