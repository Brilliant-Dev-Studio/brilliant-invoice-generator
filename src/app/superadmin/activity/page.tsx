import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { many } from "@/lib/db";
import { T } from "@/components/language-provider";
import { getTranslations } from "@/lib/server-language";
type Event = {
  id: string;
  actor: string;
  company: string;
  action: string;
  targetId: string;
  createdAt: Date;
};
export default async function PlatformActivity({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; before?: string }>;
}) {
  const t = await getTranslations();
  await requireUser(["SUPERADMIN"]);
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 250) : "";
  const before =
    typeof params.before === "string" && /^\d{1,18}$/.test(params.before)
      ? params.before
      : "9223372036854775807";
  const events = await many<Event>(
    `SELECT a.id::text,u.name AS actor,c.name AS company,a.action,a.targetId,a.createdAt FROM audit a LEFT JOIN users u ON u.id=a.actorId LEFT JOIN companies c ON c.id=u.companyId WHERE a.id<$1::bigint AND ($2='' OR strpos(lower(concat_ws(' ',u.name,c.name,a.action,a.targetId)),lower($2))>0) ORDER BY a.id DESC LIMIT 51`,
    before,
    q,
  );
  const visible = events.slice(0, 50);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            <T text="PLATFORM TRACKING" />
          </span>
          <h1>
            <T text="Activity history" />
          </h1>
          <p>
            <T text="Recorded actions across all companies, including account changes, subscriptions, and invoice activity." />
          </p>
        </div>
      </div>
      <form className="table-toolbar">
        <input
          className="input"
          name="q"
          defaultValue={q}
          aria-label={t("Search activity")}
          placeholder={t("Search actor, company, action, or target ID...")}
        />
        <button className="button button-primary">
          <T text="Search activity" />
        </button>
      </form>
      <div className="panel table-scroll">
        <table className="account-table">
          <thead>
            <tr>
              <th>
                <T text="Time (Yangon)" />
              </th>
              <th>
                <T text="Actor" />
              </th>
              <th>
                <T text="Actor company" />
              </th>
              <th>
                <T text="Action" />
              </th>
              <th>
                <T text="Target ID" />
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((e) => (
              <tr key={e.id}>
                <td data-label={t("Time")}>
                  {new Intl.DateTimeFormat("en-GB", {
                    timeZone: "Asia/Yangon",
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(e.createdAt)}
                </td>
                <td data-label={t("Actor")}>
                  {e.actor || <T text="Unknown actor" />}
                </td>
                <td data-label={t("Actor company")}>{e.company || "—"}</td>
                <td data-label={t("Action")}>{e.action}</td>
                <td data-label={t("Target")}>
                  <code>{e.targetId}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && (
          <p className="empty-state">
            <T text="No recorded activity matches." />
          </p>
        )}
      </div>
      <div className="table-toolbar">
        {params.before && (
          <Link
            className="button button-secondary"
            href={`/superadmin/activity?q=${encodeURIComponent(q)}`}
          >
            <T text="Latest activity" />
          </Link>
        )}
        {events.length > 50 && (
          <Link
            className="button button-secondary"
            href={`/superadmin/activity?q=${encodeURIComponent(q)}&before=${visible.at(-1)!.id}`}
          >
            <T text="Older activity" />
          </Link>
        )}
      </div>
    </>
  );
}
