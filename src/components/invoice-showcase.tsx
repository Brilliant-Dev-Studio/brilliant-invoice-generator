"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { InvoicePreview } from "./invoice-preview";
import { MascotWidget } from "./MascotWidget";
import { T, useTranslations } from "./language-provider";
import "./invoice-showcase.css";

export function InvoiceShowcase({
  open,
  onClose,
  backLabel = "Back to editor",
  ...invoice
}: ComponentProps<typeof InvoicePreview> & {
  open: boolean;
  onClose: () => void;
  backLabel?: string;
}) {
  const t = useTranslations();
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    yaw: number;
    pitch: number;
  } | null>(null);
  const [angle, setAngle] = useState({ yaw: -12, pitch: 5 });
  const [size, setSize] = useState({ scale: 0.5, height: 900 });

  useEffect(() => {
    if (!open) {
      dialog.current?.close();
      return;
    }
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const observer = new ResizeObserver(() => {
      if (!stage.current || !paper.current) return;
      const height = paper.current.offsetHeight;
      setSize({
        height,
        scale: Math.max(
          0.05,
          Math.min(
            (stage.current.clientWidth - 48) / 720,
            (stage.current.clientHeight - 40) / height,
            1,
          ),
        ),
      });
    });
    if (stage.current) observer.observe(stage.current);
    if (paper.current) observer.observe(paper.current);
    return () => {
      observer.disconnect();
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="invoice-showcase"
      aria-label={t("3D invoice preview")}
      onCancel={onClose}
    >
      <div className="showcase-light" aria-hidden="true" />
      <header className="showcase-toolbar">
        <button type="button" autoFocus onClick={onClose}>
          <ArrowLeft size={18} />
          <T text={backLabel} />
        </button>
        <span>
          <Sparkles size={16} />
          <T text="3D invoice preview" />
        </span>
        <button type="button" onClick={() => setAngle({ yaw: 0, pitch: 0 })}>
          <RotateCcw size={16} />
          <T text="Reset view" />
        </button>
      </header>
      <div
        className="showcase-stage"
        ref={stage}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            yaw: angle.yaw,
            pitch: angle.pitch,
          };
        }}
        onPointerMove={(event) => {
          const start = drag.current;
          if (!start || start.id !== event.pointerId) return;
          setAngle({
            yaw: start.yaw + (event.clientX - start.x) * 0.65,
            pitch: start.pitch - (event.clientY - start.y) * 0.65,
          });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <div
          className="showcase-object"
          style={{ width: 720 * size.scale, height: size.height * size.scale }}
        >
          <div
            className="showcase-rotation"
            style={{
              transform: `rotateX(${angle.pitch}deg) rotateY(${angle.yaw}deg)`,
            }}
          >
            <div className="showcase-front">
              <div
                className="showcase-document"
                ref={paper}
                style={{ transform: `scale(${size.scale})` }}
              >
                <InvoicePreview {...invoice} />
              </div>
            </div>
            <div className="showcase-back" aria-hidden="true">
              <Sparkles size={36} />
              <strong>{invoice.company.name}</strong>
              <span>{invoice.number || "INV-DRAFT"}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="showcase-mascot">
        <MascotWidget character="complete" context="showcase" compact />
        <p>
          <T text="Now that's a brilliant invoice!" />
        </p>
      </div>
      <footer className="showcase-controls">
        <label htmlFor="invoice-rotation">
          <T text="Drag or swipe to rotate" />
          <span>{Math.round(((angle.yaw % 360) + 360) % 360)}°</span>
        </label>
        <input
          id="invoice-rotation"
          type="range"
          min="0"
          max="360"
          value={((angle.yaw % 360) + 360) % 360}
          onChange={(event) =>
            setAngle((current) => ({
              ...current,
              yaw: Number(event.target.value),
            }))
          }
        />
      </footer>
    </dialog>
  );
}
