"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export function SessionMonitor() {
  const router = useRouter();
  useEffect(() => {
    let active = true;
    async function check() {
      try {
        const r = await fetch("/api/session", { cache: "no-store" });
        if (r.status === 401 && active) {
          const data = await r.json();
          router.replace(
            `/login${data.error === "suspended" ? "?error=suspended" : ""}`,
          );
        }
      } catch {
        /* Retry when the connection returns. */
      }
    }
    const timer = setInterval(check, 15000);
    window.addEventListener("focus", check);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", check);
    };
  }, [router]);
  return null;
}
