"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CloudSun, MessageCircle, X } from "lucide-react";
import { MascotWidget } from "./MascotWidget";
import { useTranslations } from "./language-provider";
import {
  companionMessages,
  type CompanionStats,
  type CompanionWeather,
} from "@/lib/mascot-companion";
import "./account-companion.css";

export function AccountCompanion({ name }: { name: string }) {
  const slot = useRef<HTMLDivElement>(null);
  const t = useTranslations();
  const path = usePathname();
  const [stats, setStats] = useState<CompanionStats | null>(null);
  const [hour, setHour] = useState(12);
  const [turn, setTurn] = useState(0);
  const [weather, setWeather] = useState<CompanionWeather | null>(null);
  const [weatherStatus, setWeatherStatus] = useState("");
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [manual, setManual] = useState(false);
  const [engaged, setEngaged] = useState(false);
  useEffect(() => {
    const navigation = document.querySelector<HTMLElement>(".topbar nav");
    if (!navigation) return;
    function measure() {
      if (!navigation || !slot.current) return;
      const box = navigation.getBoundingClientRect();
      const bottomDock =
        getComputedStyle(navigation).position === "fixed" &&
        box.top > window.innerHeight / 2;
      slot.current.style.setProperty(
        "--companion-nav-clearance",
        `${bottomDock ? Math.max(0, window.innerHeight - box.top) : 0}px`,
      );
    }
    const observer = new ResizeObserver(measure);
    observer.observe(navigation);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      if (document.visibilityState === "hidden") return;
      setHour(new Date().getHours());
      try {
        const response = await fetch("/api/mascot", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const next = await response.json();
        if (
          [next?.total, next?.issued, next?.paid, next?.drafts].every(
            (n) => Number.isInteger(n) && n >= 0,
          )
        )
          setStats(next);
      } catch {
        /* Keep time-based encouragement when activity is unavailable. */
      }
    }
    const initial = setTimeout(() => {
      setTurn(0);
      setSpeaking(false);
      setEngaged(false);
      void refresh();
    }, 0);
    const interval = setInterval(() => void refresh(), 60000);
    window.addEventListener("focus", refresh);
    return () => {
      controller.abort();
      clearTimeout(initial);
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [path]);
  useEffect(() => {
    if (engaged || loadingWeather) return;
    let timer: ReturnType<typeof setTimeout>;
    function schedule() {
      timer = setTimeout(
        () => {
          if (speaking) {
            setSpeaking(false);
          } else if (
            document.visibilityState === "visible" &&
            !document.querySelector("dialog[open]")
          ) {
            setManual(false);
            setTurn((value) => value + 1);
            setSpeaking(true);
          } else {
            schedule();
          }
        },
        speaking ? 10000 : 45000 + Math.random() * 45000,
      );
    }
    schedule();
    return () => clearTimeout(timer);
  }, [speaking, engaged, loadingWeather]);
  useEffect(() => {
    if (!weather) return;
    // Never describe an old weather reading as current.
    const expiry = setTimeout(() => setWeather(null), 30 * 60000);
    return () => clearTimeout(expiry);
  }, [weather]);

  function loadWeather() {
    if (!navigator.geolocation) {
      setWeatherStatus(
        "Weather is unavailable. I'm still here to cheer you on!",
      );
      return;
    }
    setLoadingWeather(true);
    setWeatherStatus("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const query = new URLSearchParams({
            latitude: coords.latitude.toFixed(1),
            longitude: coords.longitude.toFixed(1),
            current: "temperature_2m,weather_code",
          });
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?${query}`,
            { signal: AbortSignal.timeout(10000) },
          );
          if (!response.ok) throw new Error("Weather unavailable");
          const { current } = await response.json();
          if (
            !Number.isFinite(current?.temperature_2m) ||
            !Number.isInteger(current?.weather_code)
          )
            throw new Error("Invalid weather");
          const reading = {
            temperature: current.temperature_2m,
            code: current.weather_code,
          };
          setWeather(reading);
          setTurn(
            companionMessages(stats, new Date().getHours(), reading).length - 2,
          );
        } catch {
          setWeatherStatus(
            "Weather is unavailable. I'm still here to cheer you on!",
          );
        } finally {
          setLoadingWeather(false);
        }
      },
      () => {
        setLoadingWeather(false);
        setWeatherStatus(
          "Weather is unavailable. I'm still here to cheer you on!",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 30 * 60000 },
    );
  }

  const messages = companionMessages(stats, hour, weather);
  const message = messages[turn % messages.length];
  const text = t(message.text, message.values);
  function talk() {
    setManual(true);
    setSpeaking(true);
    setTurn((value) => value + 1);
  }
  return (
    <div ref={slot} className="companion-slot no-print">
      <aside
        className="account-companion"
        aria-label={t("Your San Pya companion")}
      >
        <MascotWidget
          context="companion"
          character={stats?.issued ? "complete" : "invoice"}
          message={t("Talk to your companion")}
          onInteract={talk}
        />
        {speaking && (
          <div
            className="companion-speech"
            onPointerEnter={() => setEngaged(true)}
            onPointerLeave={() => setEngaged(false)}
            onFocusCapture={() => setEngaged(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setEngaged(false);
            }}
          >
            <button
              type="button"
              className="companion-dismiss"
              aria-label={t("Hide mascot message")}
              onClick={() => {
                setEngaged(false);
                setSpeaking(false);
              }}
            >
              <X size={14} />
            </button>
            <span className="companion-greeting">
              {t("Hello, {name}", { name })}
            </span>
            <p role="status">{text}</p>
            {manual && (
              <div className="companion-tools">
                <button
                  type="button"
                  onClick={talk}
                  aria-label={t("Another encouraging thought")}
                >
                  <MessageCircle size={15} />
                </button>
                <button
                  type="button"
                  onClick={loadWeather}
                  disabled={loadingWeather}
                  title={t(
                    "Shares approximate location with Open-Meteo for local weather.",
                  )}
                >
                  <CloudSun size={15} />
                  {loadingWeather
                    ? t("Checking weather...")
                    : weather
                      ? `${Math.round(weather.temperature)}°C`
                      : t("Use local weather")}
                </button>
                {weather && (
                  <a
                    href="https://open-meteo.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open-Meteo
                  </a>
                )}
              </div>
            )}
            {manual && weatherStatus && (
              <small role="status">{t(weatherStatus)}</small>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
