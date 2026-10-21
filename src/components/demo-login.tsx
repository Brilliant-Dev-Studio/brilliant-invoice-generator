"use client";
import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { loginDemo } from "@/actions/auth";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo-config";
import { Button } from "./ui/button";
import { T } from "./language-provider";
import "./demo.css";

export function DemoLogin() {
  const [state, action, pending] = useActionState(loginDemo, null);
  return (
    <form action={action} className="demo-login">
      <div className="demo-login-heading">
        <Sparkles size={18} />
        <strong>
          <T text="Explore San Pya" />
        </strong>
      </div>
      <p>
        <T text="Sample invoices, clients, and products. No signup needed." />
      </p>
      <dl>
        <div>
          <dt>
            <T text="Email" />
          </dt>
          <dd>{DEMO_EMAIL}</dd>
        </div>
        <div>
          <dt>
            <T text="Password" />
          </dt>
          <dd>{DEMO_PASSWORD}</dd>
        </div>
      </dl>
      <Button variant="secondary" disabled={pending} type="submit">
        {pending ? <T text="Signing in..." /> : <T text="Try Demo" />}
        <Sparkles size={16} />
      </Button>
      <small>
        <T text="Shared public workspace. Resets daily. Please use sample data only." />
      </small>
      {state?.ok === false && (
        <p role="alert" className="message error">
          <T text={state.error} />
        </p>
      )}
    </form>
  );
}
