"use client";
/* eslint-disable @next/next/no-img-element */
import { Fragment, useRef, useState } from "react";
import {
  Check,
  ImagePlus,
  PenLine,
  Upload,
  Building2,
  QrCode,
} from "lucide-react";
import {
  saveCompany,
  saveInvoiceAppearance,
  uploadAsset,
} from "@/actions/settings";
import type { Company } from "@/lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { InvoiceDesignPicker } from "./invoice-design-picker";
import { SettingsInvoicePreview } from "./settings-invoice-preview";
import {
  DEFAULT_INVOICE_DESIGN,
  type InvoiceDesign,
} from "@/lib/invoice-design";
import { T, useTranslations } from "@/components/language-provider";
import { ImageCropper } from "./image-cropper";
import styles from "./settings-assets.module.css";
export function SettingsForm({
  company,
  storageReady,
}: {
  company: Company;
  storageReady: boolean;
}) {
  const t = useTranslations();
  const [data, setData] = useState({
    ...company,
    invoiceDesign: { ...(company.invoiceDesign ?? DEFAULT_INVOICE_DESIGN) },
  });
  const [pending, setPending] = useState(false);
  const [crop, setCrop] = useState<{ purpose: string; file: File } | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const marked = useRef(false);
  const appearanceSaving = useRef(false);
  const [appearanceMessage, setAppearanceMessage] = useState("");
  async function updateAppearance(invoiceDesign: InvoiceDesign) {
    if (appearanceSaving.current) return;
    appearanceSaving.current = true;
    const previous = data.invoiceDesign;
    setData((current) => ({ ...current, invoiceDesign }));
    setPending(true);
    setAppearanceMessage("Saving...");
    try {
      const result = await saveInvoiceAppearance(invoiceDesign);
      if (!result.ok) throw new Error(result.error);
      setAppearanceMessage("Invoice appearance saved.");
    } catch {
      setData((current) => ({ ...current, invoiceDesign: previous }));
      setAppearanceMessage(
        "Could not save invoice appearance. Please try again.",
      );
    } finally {
      appearanceSaving.current = false;
      setPending(false);
    }
  }
  async function upload(purpose: string, file: File) {
    setPending(true);
    setMessage("");
    setSuccess(false);
    try {
      const form = new FormData();
      form.set("purpose", purpose);
      form.set("file", file);
      const result = await uploadAsset(form);
      if (result.ok) {
        setData((d) => ({ ...d, [purpose]: result.data }));
        setMessage("Uploaded. Save your profile to apply this asset.");
        setSuccess(true);
      } else setMessage(result.error);
    } catch {
      setMessage("Upload failed. Please try again.");
    } finally {
      setPending(false);
    }
  }
  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    return [
      ((e.clientX - box.left) * e.currentTarget.width) / box.width,
      ((e.clientY - box.top) * e.currentTarget.height) / box.height,
    ];
  }
  return (
    <form
      className="settings-grid"
      onSubmit={async (e) => {
        e.preventDefault();
        if (crop) return;
        setPending(true);
        setMessage("");
        try {
          const result = await saveCompany(data);
          setSuccess(result.ok);
          setMessage(result.ok ? "Company profile saved." : result.error);
        } catch {
          setSuccess(false);
          setMessage("Could not save your profile.");
        } finally {
          setPending(false);
        }
      }}
    >
      <section className="panel">
        <div className="section-heading">
          <Building2 size={18} />
          <h2>
            <T text="Company information" />
          </h2>
        </div>
        <p className="panel-description">
          <T text="Your business details appear on every new invoice." />
        </p>
        <div className="form-stack">
          {(
            [
              ["name", "Company name", "e.g. San Pya Studio"],
              ["email", "Email address", "e.g. hello@yourcompany.com"],
              ["phone", "Phone number", "e.g. 09 123 456 789"],
              ["taxId", "Tax ID", "Your business tax ID (optional)"],
            ] as const
          ).map(([key, label, placeholder]) => (
            <label key={key}>
              <T text={label} />
              <Input
                value={data[key]}
                placeholder={t(placeholder)}
                type={key === "email" ? "email" : "text"}
                required={key === "name"}
                maxLength={250}
                onChange={(e) =>
                  setData((d) => ({ ...d, [key]: e.target.value }))
                }
              />
            </label>
          ))}
          <label>
            <T text="Business address" />
            <textarea
              rows={4}
              value={data.address}
              placeholder={t("Street address, township, city")}
              maxLength={1000}
              onChange={(e) =>
                setData((d) => ({ ...d, address: e.target.value }))
              }
            />
          </label>
        </div>
      </section>
      <section className="panel">
        <div className="section-heading">
          <ImagePlus size={18} />
          <h2>
            <T text="Branding & payment" />
          </h2>
        </div>
        <p className="panel-description">
          <T text="PNG, JPEG or WebP. Maximum 5 MB per image." />
        </p>
        {!storageReady && (
          <p className="message warning">
            <T text="S3 is not configured yet. Company information can be saved; image uploads become available after your bucket and region are configured." />
          </p>
        )}
        <div className={`asset-grid ${styles.grid}`}>
          {(
            [
              ["logo", "Company logo"],
              ["signature", "Digital signature"],
              ["kpay", "KPay QR"],
              ["wavepay", "WavePay QR"],
              ["bank", "Bank QR"],
            ] as const
          ).map(([key, label]) => (
            <Fragment key={key}>
              {key === "kpay" && (
                <div className={styles.sectionTitle}>
                  <h3>
                    <T text="Payment accounts" />
                  </h3>
                  <p>
                    <T text="Add a QR image and the account your clients should pay." />
                  </p>
                </div>
              )}
              <div
                className={`asset-card ${styles.card}`}
                data-payment={
                  key === "kpay" || key === "wavepay" || key === "bank"
                }
              >
                <span className={styles.title}>
                  <T text={label} />
                  <small className={data[key] ? styles.added : styles.optional}>
                    <T text={data[key] ? "Image added" : "Optional"} />
                  </small>
                </span>
                <div className="asset-preview">
                  {data[key] ? (
                    <img src={`/api/assets/${data[key]}`} alt={t(label)} />
                  ) : key.includes("pay") || key === "bank" ? (
                    <QrCode size={30} />
                  ) : key === "signature" ? (
                    <PenLine size={30} />
                  ) : (
                    <ImagePlus size={30} />
                  )}
                </div>
                <label
                  className={`button button-secondary button-small ${styles.upload} ${!storageReady ? "disabled" : ""}`}
                >
                  <Upload size={13} />
                  {data[key] ? <T text="Replace" /> : <T text="Upload" />}
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={!storageReady || pending}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (
                          !["image/png", "image/jpeg", "image/webp"].includes(
                            file.type,
                          ) ||
                          file.size > 5 * 1024 * 1024 ||
                          !file.size
                        ) {
                          setSuccess(false);
                          setMessage(
                            "Choose a PNG, JPEG, or WebP image under 5 MB.",
                          );
                        } else setCrop({ purpose: key, file });
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
                {(key === "kpay" || key === "wavepay" || key === "bank") && (
                  <div className={`payment-account-fields ${styles.fields}`}>
                    {(
                      [
                        ["name", "Account name"],
                        ["number", "Account number"],
                      ] as const
                    ).map(([field, title]) => (
                      <label key={field}>
                        <T text={title} />
                        <Input
                          type="text"
                          placeholder={t(
                            field === "name"
                              ? "Name registered on this account"
                              : key === "bank"
                                ? "Enter your bank account number"
                                : "e.g. 09 123 456 789",
                          )}
                          maxLength={field === "name" ? 250 : 100}
                          value={data.paymentAccounts?.[key]?.[field] ?? ""}
                          disabled={pending}
                          onChange={(event) =>
                            setData((current) => ({
                              ...current,
                              paymentAccounts: {
                                ...current.paymentAccounts,
                                [key]: {
                                  name:
                                    current.paymentAccounts?.[key]?.name ?? "",
                                  number:
                                    current.paymentAccounts?.[key]?.number ??
                                    "",
                                  [field]: event.target.value,
                                },
                              },
                            }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                )}
                {data[key] && (
                  <button
                    type="button"
                    className={`text-button ${styles.remove}`}
                    disabled={pending}
                    onClick={() => setData((d) => ({ ...d, [key]: "" }))}
                  >
                    <T text="Remove" />
                  </button>
                )}
              </div>
            </Fragment>
          ))}
        </div>
        <details className={`signature-pad ${styles.signature}`}>
          <summary>
            <T text="Or draw your signature" />
          </summary>
          <canvas
            ref={canvas}
            width={1800}
            height={540}
            aria-label={t("Draw your signature")}
            onPointerDown={(e) => {
              drawing.current = true;
              marked.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              const context = e.currentTarget.getContext("2d")!;
              const [x, y] = point(e);
              context.beginPath();
              context.moveTo(x, y);
            }}
            onPointerMove={(e) => {
              if (!drawing.current) return;
              const context = e.currentTarget.getContext("2d")!;
              context.strokeStyle = "#142038";
              context.lineWidth = 6;
              context.lineCap = "round";
              context.lineJoin = "round";
              context.lineTo(...(point(e) as [number, number]));
              context.stroke();
            }}
            onPointerUp={() => {
              drawing.current = false;
            }}
            onPointerCancel={() => {
              drawing.current = false;
            }}
          />
          <div className="heading-actions">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const element = canvas.current;
                element
                  ?.getContext("2d")
                  ?.clearRect(0, 0, element.width, element.height);
                marked.current = false;
              }}
            >
              <T text="Clear" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!storageReady || pending}
              onClick={() => {
                if (!marked.current) {
                  setSuccess(false);
                  setMessage("Draw your signature first.");
                  return;
                }
                canvas.current?.toBlob((blob) => {
                  if (blob)
                    void upload(
                      "signature",
                      new File([blob], "signature.png", { type: "image/png" }),
                    );
                });
              }}
            >
              <T text="Use signature" />
            </Button>
          </div>
        </details>
      </section>
      <section
        className="panel settings-invoice-design"
        aria-label={t("Invoice design")}
      >
        <h2>
          <T text="Default invoice appearance" />
        </h2>
        <p className="panel-description">
          <T text="Choose your brand colors, paper theme, and template once." />
        </p>
        <div className="settings-appearance-layout">
          <InvoiceDesignPicker
            value={data.invoiceDesign}
            onChange={(invoiceDesign) => void updateAppearance(invoiceDesign)}
            disabled={pending}
            note="Appearance saves automatically for new invoices. Existing invoices keep their design."
          />
          <SettingsInvoicePreview company={data} />
        </div>
        {appearanceMessage && (
          <p role="status" className="panel-description">
            <T text={appearanceMessage} />
          </p>
        )}
      </section>
      {crop && (
        <ImageCropper
          file={crop.file}
          payment={["kpay", "wavepay", "bank"].includes(crop.purpose)}
          onCancel={() => setCrop(null)}
          onConfirm={(file) => {
            const purpose = crop.purpose;
            setCrop(null);
            void upload(purpose, file);
          }}
        />
      )}
      <div className="settings-footer">
        {message && (
          <p
            className={`message ${success ? "success" : "error"}`}
            role="status"
          >
            <T text={message} />
          </p>
        )}
        <Button disabled={pending}>
          <Check size={16} />
          {pending ? <T text="Saving..." /> : <T text="Save company profile" />}
        </Button>
      </div>
    </form>
  );
}
