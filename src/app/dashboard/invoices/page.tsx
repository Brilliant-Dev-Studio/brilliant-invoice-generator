import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { invoices } from "@/lib/db";
import { statusOf } from "@/lib/money";
import { InvoiceTable } from "@/components/invoice-table";
import { Button } from "@/components/ui/button";
import { T } from "@/components/language-provider";
import { getTranslations } from "@/lib/server-language";
export default async function Invoices({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const t = await getTranslations();
  const user = await requireUser();
  const params = await searchParams;
  const all = await invoices(user.companyId);
  const statuses = ["ALL", "DRAFT", "UNPAID", "PAID", "OVERDUE"];
  const status = statuses.includes(params.status || "")
    ? params.status!
    : "ALL";
  const query = (params.q || "").slice(0, 250);
  const filtered = all.filter(
    (i) =>
      (status === "ALL" || statusOf(i) === status) &&
      `${i.number} ${i.client.name} ${i.title}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  const page = Math.min(
    pages,
    Math.max(1, Number.parseInt(params.page || "1", 10) || 1),
  );
  const href = (p: number) =>
    `?${new URLSearchParams({ status, q: query, page: String(p) })}`;
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            <T text="FROM SENT TO SETTLED" />
          </span>
          <h1>
            <T text="Invoices" />
            <span className="heading-dot">.</span>
          </h1>
          <p>
            <T text="Every project, every payment. All in one place." />
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/new">
            <Plus size={16} />
            <T text="New invoice" />
          </Link>
        </Button>
      </div>
      <div className="table-toolbar">
        <div className="filter-tabs">
          {statuses.map((s) => (
            <Link
              key={s}
              href={`?${new URLSearchParams({ status: s, q: query })}`}
              className={s === status ? "selected" : ""}
            >
              <T text={s.charAt(0) + s.slice(1).toLowerCase()} />
              <span>
                {all.filter((i) => s === "ALL" || statusOf(i) === s).length}
              </span>
            </Link>
          ))}
        </div>
        <form className="search-field">
          <Search size={16} />
          <input
            name="q"
            aria-label={t("Search invoices")}
            placeholder={t("Search invoices...")}
            defaultValue={query}
          />
          <input type="hidden" name="status" value={status} />
        </form>
      </div>
      <section className="panel table-panel">
        <InvoiceTable
          invoices={filtered.slice((page - 1) * 20, page * 20)}
          filtered={status !== "ALL" || !!query}
        />
        <div className="pagination">
          <span>
            {filtered.length} <T text="invoices · Page" /> {page}{" "}
            <T text="of" /> {pages}
          </span>
          <div>
            {page > 1 && (
              <Link href={href(page - 1)}>
                <T text="Previous" />
              </Link>
            )}
            {page < pages && (
              <Link href={href(page + 1)}>
                <T text="Next" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
