"use client";
import { AccountCompanion } from "./AccountCompanion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Files,
  Users,
  Settings,
  ShieldCheck,
  LogOut,
  Plus,
} from "lucide-react";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-provider";
import { SessionMonitor } from "./session-monitor";
import { logout } from "@/actions/auth";
import type { User } from "@/lib/types";
import {
  T,
  useTranslations,
  useLanguage,
} from "@/components/language-provider";
import { LanguageSwitcher } from "./language-switcher";
export function Shell({
  user,
  companyName,
  children,
}: {
  user: User;
  companyName: string;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const locale = useLanguage();
  const mobileLabels: Record<string, string> =
    locale === "my"
      ? {
          Overview: "ပင်မ",
          Invoices: "ပြေစာ",
          Clients: "ဖောက်သည်",
          Team: "အဖွဲ့",
          Settings: "ဆက်တင်",
          Companies: "ကုမ္ပဏီ",
          Accounts: "အကောင့်",
          Activity: "မှတ်တမ်း",
        }
      : { Overview: "Home" };
  const path = usePathname();
  const print = path.endsWith("/print");
  const owner = user.role === "SUPERADMIN";
  const links = owner
    ? [
        { href: "/superadmin", label: "Overview", icon: LayoutGrid },
        { href: "/superadmin/clients", label: "Companies", icon: Users },
        { href: "/superadmin/accounts", label: "Accounts", icon: ShieldCheck },
        { href: "/superadmin/activity", label: "Activity", icon: Files },
      ]
    : [
        { href: "/dashboard", label: "Overview", icon: LayoutGrid },
        { href: "/dashboard/invoices", label: "Invoices", icon: Files },
        { href: "/dashboard/clients", label: "Clients", icon: Users },
        ...(user.role !== "STAFF"
          ? [
              { href: "/dashboard/team", label: "Team", icon: Users },
              {
                href: "/dashboard/settings",
                label: "Settings",
                icon: Settings,
              },
            ]
          : []),
      ];
  if (print)
    return (
      <>
        <SessionMonitor />
        {children}
      </>
    );
  return (
    <div
      className={`app-shell ${owner ? "owner-workspace" : "client-workspace"}`}
    >
      <SessionMonitor />
      <header className="topbar no-print">
        <Link
          href={owner ? "/superadmin" : "/dashboard"}
          aria-label={t("San Pya dashboard")}
        >
          <Brand />
        </Link>
        <div className="nav-divider" />
        <nav aria-label={t("Main navigation")}>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-label={t(label)}
              aria-current={
                (
                  href === "/dashboard" || href === "/superadmin"
                    ? path === href
                    : path.startsWith(href)
                )
                  ? "page"
                  : undefined
              }
              className={
                (
                  href === "/dashboard" || href === "/superadmin"
                    ? path === href
                    : path.startsWith(href)
                )
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <Icon size={17} />
              <span className="nav-label-full" aria-hidden="true">
                <T text={label} />
              </span>
              <span className="nav-label-short" aria-hidden="true">
                {mobileLabels[label] ?? label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="account">
          <ThemeToggle />
          <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
          <span className="account-name">
            {user.name}
            <small>
              <T text={user.role} />
            </small>
          </span>
          <form action={logout}>
            <button
              className="icon-button"
              title={t("Sign out")}
              aria-label={t("Sign out")}
            >
              <LogOut size={17} />
            </button>
          </form>
        </div>
      </header>
      <div className="workspace-bar no-print">
        <span className="workspace-identity">
          <span className="workspace-dot" />
          <span className="workspace-company" title={companyName}>
            {companyName}
          </span>
        </span>
        <div className="workspace-tools">
          <LanguageSwitcher />
        </div>
      </div>
      <main className="main-content">
        {children}
        <AccountCompanion name={user.name} />
      </main>
      <footer className="app-footer no-print">
        <span>San Pya Invoice</span>
        <span>
          <T text="Made for business. Built for clarity." />
        </span>
        <Link href={owner ? "/superadmin/accounts" : "/dashboard/invoices/new"}>
          <Plus size={13} />{" "}
          {owner ? (
            <T text="Create client account" />
          ) : (
            <T text="New invoice" />
          )}
        </Link>
      </footer>
    </div>
  );
}
