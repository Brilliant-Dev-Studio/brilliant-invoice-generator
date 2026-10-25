"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "./navigation-progress.css";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickleRef = useRef<number | undefined>(undefined);
  const hideRef = useRef<number | undefined>(undefined);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (hideRef.current) window.clearTimeout(hideRef.current);
    setProgress(100);
    hideRef.current = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 320);
    return () => {
      if (hideRef.current) window.clearTimeout(hideRef.current);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    const start = () => {
      if (hideRef.current) window.clearTimeout(hideRef.current);
      setVisible(true);
      setProgress(14);
    };
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank") return;
      if (anchor.hasAttribute("download")) return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        const query = searchParams.toString();
        const current = query ? `${pathname}?${query}` : pathname;
        const next = `${url.pathname}${url.search}`;
        if (next === current) return;
        start();
      } catch {
        /* Ignore malformed href values. */
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!visible) {
      if (trickleRef.current) window.clearInterval(trickleRef.current);
      return;
    }
    trickleRef.current = window.setInterval(() => {
      setProgress((value) => (value >= 92 ? value : value + 4 + Math.random() * 6));
    }, 220);
    return () => {
      if (trickleRef.current) window.clearInterval(trickleRef.current);
    };
  }, [visible]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="route-progress"
      role="progressbar"
      aria-hidden="true"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <div
        className="route-progress-bar"
        style={{ transform: `scaleX(${Math.min(progress, 100) / 100})` }}
      />
    </div>
  );
}
