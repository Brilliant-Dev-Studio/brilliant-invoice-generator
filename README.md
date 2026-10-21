# Brilliant Invoice Generator

A company-isolated invoice workspace built with Next.js 16 App Router, React, strict TypeScript, Tailwind CSS, shadcn-style UI primitives, and PostgreSQL. The dark invoice editor follows the supplied reference; PDF and A4 print use the same invoice component with a paper-friendly stylesheet.

## Start locally

Requires **Node.js 24+**, npm, and Docker Desktop running. PostgreSQL runs locally in Docker; the app runs on your machine.

```sh
npm install
npm run db:up
cp .env.example .env.local
openssl rand -hex 32
```

The local database listens on `127.0.0.1:5433`, with database/user `brilliant` and development-only password `brilliant_local`. `.env.example` includes the matching `DATABASE_URL`. Data persists in the `postgres_data` Docker volume. `npm run db:down` stops the database without deleting its data. If port 5433 is occupied, use `POSTGRES_PORT=5434 npm run db:up` and update `DATABASE_URL` accordingly.

Set `JWT_SECRET` to the generated value. Set `BOOTSTRAP_EMAIL`, a unique `BOOTSTRAP_PASSWORD` of 12-128 characters, `BOOTSTRAP_NAME`, and `BOOTSTRAP_COMPANY` in `.env.local`.

```sh
npm run bootstrap
npm run dev
```

Open http://localhost:3000 and sign in with those credentials. Administrator accounts require bootstrap credentials; there is no public signup. The login page also offers a shared demo account with sample data. Run `npm run db:seed:demo` to provision it in advance; see [Demo sandbox](docs/demo-sandbox.md) for credentials and reset behavior. Bootstrap refuses to run once a Superadmin exists. Remove the bootstrap password from the environment after provisioning.

The Superadmin creates companies and their accounts in **Admin**. Company Admins manage company settings and existing staff access. Staff can create clients, draft/issue invoices, and print/export them. Staff cannot change company settings, reset accounts, provision users, or mark invoices paid.

## Recover platform Superadmin access

The platform control panel is `/superadmin`; all account types sign in at `/login`. A company admin cannot access the platform panel. To inspect the configured bootstrap account and list existing Superadmins, run `npm run admin:check` from a terminal with access to PostgreSQL.

If the configured account is missing, suspended, has the wrong role, or needs its password reset, run `npm run admin:recover`. This explicitly restores the account identified by `BOOTSTRAP_EMAIL` to active Superadmin status using `BOOTSTRAP_PASSWORD` from `.env.local`. It creates the account if missing, preserves its company if it exists, revokes its sessions, clears its login lockout, and records an audit event. Other accounts and business data are unchanged. Sign in again after recovery. This command requires direct database access and is not exposed as a web endpoint.

## Public landing page

`/` is the public, responsive marketing page; `/login` opens the workspace sign-in. The landing page includes the supplied MMK pricing, plan descriptions, bonuses, features, and service commitments, with light and dark themes. Its English/Myanmar selector persists a language cookie for one year and renders the selected language on the server. Translations live in `src/lib/landing-language.ts`; workspace pages remain in English.

Set `SALES_CONTACT_URL` in `.env.local` to your public sales URL (`https:`, `mailto:`, or `tel:`) and restart the app to enable the **Contact Brilliant** button. Each **Choose plan** button opens a plan summary visitors can copy for an activation request. It does not collect payments, submit requests, or provision subscriptions automatically.

The landing-page copy reflects the supplied offering. A reusable product catalog, automatic cloud backup scheduling, and 24/7 support operations are not implemented by this page and must be provided separately before offering those services.

The eight feature illustrations are original, locally rendered 3D-style artwork. Editable SVG sources and transparent WebP images live in `public/images/features/`. Regenerate them with `node scripts/generate-feature-art.mjs`; no API key or network service is required. The landing page uses responsive, lazy-loaded images through Next.js Image.

## Features

- Revocable eight-hour JWT sessions in HTTP-only cookies; production cookies are Secure. Suspension and password resets revoke all sessions. Every protected request rechecks database status; open tabs check every 15 seconds and on focus.
- User provisioning, Active/Suspended controls, password reset, and account audit records. Login identifiers accept email or exact optional phone number; failed attempts are limited per identifier for 15 minutes.
- Company information, logo, uploaded/drawn signature, and KPay/WavePay/bank QR assets.
- Client management and inline client creation in the invoice editor.
- Per-company/year invoice sequences allocated within PostgreSQL transactions. Draft editing uses a revision check; issued invoices are immutable snapshots.
- Exact minor-unit arithmetic, up to three decimal quantity places, percentage/fixed discounts, tax after discount, and USD/MMK/THB. Amounts use two decimal places in all three currencies. Currency selection does not perform conversion.
- Draft, unpaid, paid, and derived overdue filters; paid actions record payment time. Analytics show monthly paid revenue and outstanding balance separately by currency. Invoice count includes drafts.
- Browser printing and downloadable Chromium-rendered PDFs from the same canonical invoice component. Private image fetches are authenticated.

The business date and monthly revenue timezone are **Asia/Yangon**. An unpaid invoice becomes overdue the day after its due date. Dates do not depend on the user's device timezone. The maximum line amount is 1 billion currency units, and each invoice supports 100 lines.

## PDF download

Install the browser executable on the machine running the app:

```sh
npx playwright install chromium
# Linux deployments may also require:
npx playwright install --with-deps chromium
```

Alternatively set `CHROMIUM_EXECUTABLE_PATH` to an installed compatible Chrome/Chromium executable. Set `APP_URL` to the app's trusted origin, reachable by the server itself. It must not come from request headers. Local development uses `http://localhost:3000`; production must use HTTPS.

PDF export launches a short-lived headless browser, renders the authenticated print route, waits for fonts/images, and returns a downloadable A4 PDF. Browser Print remains available if Chromium is not installed. Missing/broken branding images cause PDF generation to fail visibly rather than silently omit a QR or signature.

## Platform languages

English and Myanmar are available on the public site, login, client workspace,
and platform-owner screens. Use the language selector in the workspace bar.
The `brilliant_language` cookie remembers the selection for one year; changing
language refreshes translated content while preserving mounted form state.

`src/lib/platform-language.ts` contains platform translations and reuses the
public-site dictionary. Use `T` for UI text, `useTranslations` for client-side
attributes, and `getTranslations` in server components. Use named placeholders
for dynamic sentences. Keep user-entered names, descriptions, identifiers,
stored status values, and form submission values untranslated. Unknown messages
fall back to English. Printed/PDF invoice labels retain their existing English
template; interface language does not change saved invoice content.

Run `node --experimental-strip-types --test tests/platform-language.test.ts`
to check locale fallback, interpolation, and static translation coverage.

## Configure private S3 uploads

Supply these variables when the bucket is ready:

```dotenv
AWS_REGION=ap-southeast-1
S3_BUCKET=your-private-bucket
```

Use a deployment IAM role when possible. For local development, set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`, or use the AWS SDK's standard profile/credential chain. Temporary credentials can also use `AWS_SESSION_TOKEN`. Never use `NEXT_PUBLIC_` for secrets.

The application's role needs `s3:PutObject` and `s3:GetObject` on `arn:aws:s3:::YOUR_BUCKET/companies/*`. Keep S3 Block Public Access enabled. Uploads go through authenticated Server Actions, so browser-to-S3 CORS rules are not required. Images are decoded and re-encoded as static PNGs; only PNG/JPEG/WebP under 5 MB and 16 million pixels are accepted. Animated images and SVG are rejected.

Objects use immutable company-scoped keys. Stored asset IDs are checked against company and asset purpose before saving settings. Invoice snapshots retain their original branding assets. Removed or abandoned assets are intentionally retained; introduce retention cleanup only after checking historical references. Uploads are visibly disabled until the bucket and region are configured. Actual bucket access still depends on valid credentials and IAM permissions.

## Persistence and deployment

- `DATABASE_URL` connects to PostgreSQL. Schema migration 1 is applied idempotently on connection; tables and indexes live in `src/lib/db.ts`.
- Docker Compose is for local development. Use a managed PostgreSQL database or a backed-up PostgreSQL server for deployment, with separate credentials and provider-required TLS settings.
- Transactions use a dedicated pooled connection and an advisory lock to preserve serialized read/check/write behavior for invoice revisions, counters, and account changes. This favors correctness for this small app over high write throughput.
- Use PostgreSQL backup tools such as `pg_dump`. The app no longer reads SQLite files; existing SQLite data requires a separate migration before switching.
- Set `JWT_SECRET`, `DATABASE_URL`, `APP_URL`, and S3 configuration on the server. Rotate the JWT secret to revoke all tokens. Terminate HTTPS before the app and configure your proxy to overwrite forwarded headers safely.
- Add an edge-level IP rate limiter before public deployment; the application already limits login attempts per identifier. Monitor expensive PDF requests and size concurrency limits for the deployment.
- Provision Chromium and required OS libraries for PDF export. S3 and browser execution must be available from the server.

```sh
npm run build
npm start
```

The build script uses Webpack for compatibility with restricted build environments. Development uses Turbopack; `npm run dev -- --webpack` is available if needed.

## Validation

### Vercel login configuration

In Vercel **Project Settings > Environment Variables**, configure `DATABASE_URL`, `APP_URL` (your deployed HTTPS URL), and `JWT_SECRET` for Production. Local `.env.local` values are not uploaded to Vercel.

Generate a session secret with `openssl rand -hex 32` and save the output as `JWT_SECRET`. Login requires at least 32 characters. After adding or changing these variables, redeploy for them to take effect. The message "The administrator needs to configure the session secret before login" means `JWT_SECRET` is missing or too short in that deployment.

### Project checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Integration tests require PostgreSQL (`npm run db:up`) and use isolated temporary schemas in `TEST_DATABASE_URL` or the configured `DATABASE_URL`. The database user must have permission to create schemas. Unit/integration tests and cover financial rounding, invalid inputs, session revocation, password hashing, role/company boundaries, and transaction behavior. The temporary schemas are removed after each suite. They do not touch your application database.

Manually verify before deployment: login with each role; suspend a logged-in user; create a client and invoice; issue/mark paid; change branding and confirm existing invoices retain their snapshots; upload real S3 assets; print long invoices at A4; download PDF; scan each payment QR; check the editor on a mobile screen.

The local environment used during implementation restricts browser launch, local listening ports, and external network access. S3 integration requires your configuration, and full browser/PDF visual verification must be completed in an unrestricted local or deployed environment.

## Structure

- `src/actions`: authenticated Server Actions and input validation boundaries.
- `src/lib`: database, sessions, password hashing, money rules, schemas, S3 adapter.
- `src/components`: invoice editor/preview, company settings, account management, shared UI.
- `src/app`: login, dashboard, clients, invoices, company settings, team, Superadmin, and authenticated asset/PDF endpoints.
- `src/proxy.ts`: Next.js 16 request guard, backed by live session/account checks.
- `SKILL.md`: project requirements and design direction.

Email delivery, public invoice sharing, exchange-rate conversion, recurring invoices, and accounting integrations are not included.

### Platform client subscriptions

In `/superadmin`, create an account with **New company**, select the client plan,
and set its start date. Existing companies can use **Assign plan**; **Add renewal**
appends a term without changing earlier history. Staff accounts inherit their
company's subscription. Only platform Superadmins can assign plans.

The dashboard shows client-company counts, active/scheduled/expired/no-plan status,
plan distribution, expiry dates, and total plan value. Platform-only companies
are excluded unless they have a subscription record. Counts represent companies,
not user accounts. Total plan value sums recorded terms (including renewals),
not payments received. Expiry does not automatically suspend client access.

Migration 2 creates `company_subscriptions` automatically during database
initialization. Existing companies remain unassigned until an owner selects a
plan. Prices and bonuses are server-controlled snapshots shared with the landing
page catalog: 25,000 / 75,000 / 150,000 / 300,000 MMK. Coverage uses calendar
months, clamps month-end dates, then adds bonus days. The annual plan includes
13 calendar months. Expiry is exclusive at 00:00 Asia/Yangon on the displayed
date. Renewals start on or after the last recorded expiry; overlapping terms are
rejected transactionally.

Run pure subscription checks with `node --experimental-strip-types --test tests/plans.test.ts`.
The full `npm test` suite requires PostgreSQL and uses isolated test schemas.

### Platform owner workspace

Superadmins have a dedicated navigation menu at `/superadmin`:

- **Overview:** subscription counts, plan values, expiries, renewals, and account creation.
- **Companies:** searchable client-company table with access status, plan, expiry,
  account/customer/invoice counts, and lifetime plan value. Open a company to edit
  its contact profile, suspend/reactivate company access, manage user accounts and
  plans, and inspect its customer directory and invoice activity.
- **Accounts:** platform-wide account creation, suspension, and password resets.
- **Activity:** searchable audit history with cursor pagination and Yangon timestamps.

Migration 3 adds company access status. Company suspension revokes existing tenant
sessions and blocks future tenant access; reactivation does not change individual
account suspension. Workspaces containing Superadmins cannot be suspended. Owner
profile changes preserve invoice snapshots. All platform pages and mutations check
SUPERADMIN authorization server-side. The customer and invoice tables are tracking
views; they do not expose cross-company invoice editing. Infrastructure, backups,
plan catalog pricing, and environment secrets are not editable through this UI.

The owner overview also includes interactive monthly plan-value bars, cumulative
subscribed-company growth, subscription-status distribution, and clients by plan.
Select 6 or 12 months and tap a bar for its exact value; a data table provides the
same monthly figures. Historical values use term start dates through today's
Yangon date and exclude future starts. Growth counts first subscription starts,
not account registrations, and retains clients whose subscriptions later expire.
Plan value is not payment revenue. Charts support light/dark themes and small screens.
# brilliant-invoice-generator
