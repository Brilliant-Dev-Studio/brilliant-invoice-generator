"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { useTranslations } from "../language-provider";
export function Dialog({
  open,
  onClose,
  title,
  closeLabel = "Close dialog",
  className = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open) dialog?.showModal();
    else dialog?.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`dialog ${className}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-label={t(title)}
    >
      <div className="dialog-heading">
        <h2>{t(title)}</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label={t(closeLabel)}
        >
          <X size={18} />
        </Button>
      </div>
      {children}
    </dialog>
  );
}
