"use client";

import { useRef } from "react";

export function InvoicePreviewStage({
  children,
}: {
  children: React.ReactNode;
}) {
  const sheet = useRef<HTMLDivElement>(null);
  function reset() {
    sheet.current?.style.removeProperty("--paper-x");
    sheet.current?.style.removeProperty("--paper-y");
  }
  return (
    <div
      className="invoice-depth-stage"
      onPointerMove={(event) => {
        if (
          event.pointerType !== "mouse" ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        sheet.current?.style.setProperty(
          "--paper-x",
          `${bounds.height > 1000 ? 0 : -y * 1.6}deg`,
        );
        sheet.current?.style.setProperty("--paper-y", `${-2 + x * 2}deg`);
      }}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <div className="invoice-depth-sheet" ref={sheet}>
        {children}
      </div>
    </div>
  );
}
