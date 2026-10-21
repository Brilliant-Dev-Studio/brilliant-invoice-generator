"use client";
import { useActionState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { login } from "@/actions/auth";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { T, useTranslations } from "@/components/language-provider";
export function LoginForm({ suspended }: { suspended: boolean }) {
  const t = useTranslations();
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="form-stack">
      <label>
        <T text="Email or phone" />
        <Input
          name="identifier"
          autoComplete="username"
          placeholder={t("you@company.com")}
          required
          maxLength={250}
        />
      </label>
      <label>
        <T text="Password" />
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={t("Enter your password")}
          required
          maxLength={128}
        />
      </label>
      {(suspended || state?.ok === false) && (
        <p className="message error" role="alert">
          {state?.ok === false ? (
            <T text={state.error} />
          ) : (
            <T text="Your account has been suspended. Contact your administrator." />
          )}
        </p>
      )}
      <Button disabled={pending} className="login-submit">
        {pending ? (
          <T text="Signing in..." />
        ) : (
          <T text="Sign in to workspace" />
        )}
        <ArrowRight size={18} />
      </Button>
      <p className="secure-note">
        <LockKeyhole size={13} />{" "}
        <T text="Access is provided by your administrator." />
      </p>
    </form>
  );
}
