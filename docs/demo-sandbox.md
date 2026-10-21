# Demo sandbox

The login page displays `demo@sanpya.com` / `SanPyaDemo2026!` and a Try Demo button. First login provisions the shared workspace. Subsequent logins preserve visitor changes until the last reset is at least 24 hours old. Do not enter private or real customer data: all visitors share this workspace.

The seed contains three clients, three MMK products (available in the invoice editor), and four invoices covering draft, paid, unpaid, and overdue states. Invoice counters, company settings, clients, products, and invoices return to the seed during reset. Existing demo sessions remain signed in; old invoice links may no longer exist after reset. Demo users cannot upload images or administer accounts.

Demo identity is derived from a reserved company ID after session verification, never from an editable email or invoice field. Print pages have a fixed SVG watermark repeated on every page. PDF exports verify that this watermark is present before rendering. Ordinary account exports remain unchanged.

## Daily reset

`vercel.json` schedules `/api/cron/demo-reset` daily at 00:00 UTC (06:30 Myanmar time). Set `CRON_SECRET` to a random value of at least 32 characters in the deployment environment. Vercel sends it as a Bearer authorization header. Deploy the project to activate the schedule; this configuration does not install a local cron job.

On another host, schedule an authenticated GET to the same endpoint every 24 hours using a secret stored in the scheduler. The handler rejects missing/invalid authorization and only resets the reserved demo tenant. Login also performs a due reset as a fallback if scheduling is unavailable. A production PostgreSQL database and the existing session/PDF environment configuration are required.

If `demo@sanpya.com` already belongs to an ordinary account, provisioning fails rather than taking it over. Resolve that conflict administratively before enabling the demo.
