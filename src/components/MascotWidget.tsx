"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
} from "react";
import { useTheme } from "next-themes";
import { Mascot } from "./mascot";
import { useTranslations } from "./language-provider";
import styles from "./MascotWidget.module.css";

const subscribe = () => () => {};
export function MascotWidget({
  character = "invoice",
  compact = false,
  context = "empty",
  message: customMessage,
  onInteract,
}: ComponentProps<typeof Mascot> & {
  context?: "empty" | "header" | "success" | "showcase" | "companion";
  message?: string;
  onInteract?: () => void;
}) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [greeting, setGreeting] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const t = useTranslations();
  useEffect(() => () => clearTimeout(timeout.current), []);
  const message =
    context === "success"
      ? "Invoice saved. Lovely work!"
      : mounted && resolvedTheme === "dark"
        ? "Rest easy. Your workspace is ready."
        : "Ready for your next great invoice!";
  return (
    <button
      type="button"
      className={`${styles.widget} ${compact ? styles.compact : ""} ${greeting ? styles.greeting : ""}`}
      data-context={context}
      title={customMessage ?? t(message)}
      aria-label={customMessage ?? t(message)}
      onClick={() => {
        onInteract?.();
        clearTimeout(timeout.current);
        setGreeting(true);
        timeout.current = setTimeout(() => setGreeting(false), 2200);
      }}
    >
      <span className={styles.active}>
        <Mascot
          character={context === "success" ? "complete" : character}
          compact={compact}
        />
      </span>
      <span className={styles.resting} aria-hidden="true">
        <svg viewBox="0 0 240 190" fill="none">
          <ellipse
            cx="120"
            cy="157"
            rx="67"
            ry="12"
            fill="#a6c0d8"
            opacity=".12"
          />
          <path
            d="M187 25a24 24 0 1 0 24 30 22 22 0 0 1-24-30Z"
            fill="#efd497"
          />
          <g className={styles.breathe}>
            <path
              d="M94 57c-21-24 4-30 14-5m23 0c9-25 34-19 14 5"
              fill="#fff4dc"
              stroke="#756554"
              strokeWidth="2.5"
            />
            <path
              d="m96 43 7 9m36-9-5 9"
              stroke="#edb4b6"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <rect
              x="59"
              y="118"
              width="132"
              height="39"
              rx="19"
              fill="#728fa9"
            />
            <path
              d="M80 65q0-12 12-12h59q12 0 12 12v80l-12-6-12 7-12-7-12 7-12-7-12 7-11-6Z"
              fill="#fff4dc"
              stroke="#756554"
              strokeWidth="2.5"
            />
            <path
              d="M94 72h20m-20 8h34"
              stroke="#ddcaa6"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M97 99q6 7 12 0m23 0q6 7 12 0m-29 13q5 4 10 0"
              stroke="#665747"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <ellipse
              cx="98"
              cy="111"
              rx="8"
              ry="4"
              fill="#e6b4a0"
              opacity=".7"
            />
            <ellipse
              cx="143"
              cy="111"
              rx="8"
              ry="4"
              fill="#e6b4a0"
              opacity=".7"
            />
            <path d="M70 126q51-18 104 3v21H70Z" fill="#45697d" />
            <ellipse cx="89" cy="126" rx="10" ry="6" fill="#fff4dc" />
            <ellipse cx="153" cy="126" rx="10" ry="6" fill="#fff4dc" />
            <path
              d="m95 133 2 4 4 1-4 2-2 4-1-4-4-2 4-1m43-1 2 4 4 1-4 2-2 4-1-4-4-2 4-1"
              fill="#ddc68e"
            />
          </g>
          <g
            className={styles.sleepMarks}
            stroke="#cfdded"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M157 50h9l-9 10h9m3-30h12l-12 13h12" />
          </g>
        </svg>
      </span>
      {greeting && (
        <span className={styles.affection} aria-hidden="true">
          ♡
        </span>
      )}
      {context === "success" && (
        <span className={styles.badge} aria-hidden="true">
          ✓
        </span>
      )}
      {greeting && !onInteract && (
        <span className={styles.bubble} role="status">
          {t(message)}
        </span>
      )}
    </button>
  );
}
