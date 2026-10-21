"use client";

import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { useTranslations } from "./language-provider";
import { inputValidationMessage } from "@/lib/input-validation";
import "./validation-toasts.css";

export function ValidationToasts() {
  const t = useTranslations();
  const [notice, setNotice] = useState<{
    label: string;
    message: string;
  } | null>(null);
  useEffect(() => {
    let first: HTMLElement | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    function invalid(event: Event) {
      const field = event.target;
      if (!(
        field instanceof HTMLInputElement ||
        field instanceof HTMLSelectElement ||
        field instanceof HTMLTextAreaElement
      ))
        return;
      // One failed submit can emit an invalid event for every required field.
      if (first) return;
      first = field;
      const labelElement = field.labels?.[0]?.cloneNode(true) as
        HTMLElement | undefined;
      labelElement
        ?.querySelectorAll("input, select, textarea, .input-validation-error")
        .forEach((node) => node.remove());
      const label =
        field.getAttribute("aria-label") ||
        labelElement?.textContent?.trim() ||
        "";
      setNotice({ label, message: inputValidationMessage(field.validity) });
      clearTimeout(timer);
      timer = setTimeout(() => {
        first = null;
      }, 0);
    }
    document.addEventListener("invalid", invalid, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("invalid", invalid, true);
    };
  }, []);
  return notice ? (
    <div className="validation-toast" role="alert">
      <AlertCircle size={20} aria-hidden="true" />
      <div>
        <strong>{t("Please check your input")}</strong>
        <p>
          {notice.label && `${notice.label}: `}
          {t(notice.message)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setNotice(null)}
        aria-label={t("Dismiss notification")}
      >
        <X size={18} />
      </button>
    </div>
  ) : null;
}
