"use client";
import { useState } from "react";
import {
  PLAN_IDS,
  PLANS,
  mmk,
  planTerm,
  validPlanDate,
  type PlanId,
} from "@/lib/plans";
import { Input } from "./ui/input";
import { T } from "@/components/language-provider";

export function PlanFields({
  initialStart,
  minStart,
}: {
  initialStart: string;
  minStart?: string;
}) {
  const [planId, setPlanId] = useState<PlanId>("MONTHLY");
  const [startsOn, setStartsOn] = useState(initialStart);
  const plan = PLANS[planId];
  const term = validPlanDate(startsOn) ? planTerm(planId, startsOn) : null;
  return (
    <fieldset className="plan-fields">
      <legend>
        <T text="Company subscription" />
      </legend>
      <label>
        <T text="Plan" />
        <select
          name="planId"
          value={planId}
          onChange={(event) => setPlanId(event.target.value as PlanId)}
          required
        >
          {PLAN_IDS.map((id) => (
            <option key={id} value={id}>
              <T text={PLANS[id].name} /> — {mmk(PLANS[id].priceMMK)}
            </option>
          ))}
        </select>
      </label>
      <label>
        <T text="Start date" />
        <Input
          name="startsOn"
          type="date"
          value={startsOn}
          min={minStart || "2000-01-01"}
          max="9998-01-01"
          onChange={(event) => setStartsOn(event.target.value)}
          required
        />
      </label>
      <dl className="plan-preview">
        <div>
          <dt>
            <T text="Plan price" />
          </dt>
          <dd>{mmk(plan.priceMMK)}</dd>
        </div>
        <div>
          <dt>
            <T text="Bonus" />
          </dt>
          <dd>
            {plan.bonus === "-" ? (
              <T text="No bonus" />
            ) : (
              <T text={plan.bonus} />
            )}
          </dd>
        </div>
        <div>
          <dt>
            <T text="Expires" />
          </dt>
          <dd>{term?.expiresOn || <T text="Choose a start date" />}</dd>
        </div>
      </dl>
      <p className="muted small">
        <T text="Includes the bonus period. Expiry is at 00:00 on the shown date, Asia/Yangon. One plan covers the company and its staff." />
      </p>
    </fieldset>
  );
}
