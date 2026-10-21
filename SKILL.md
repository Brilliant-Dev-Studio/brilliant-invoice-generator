---
name: brilliant-invoice-generator
description: Build and maintain the Brilliant Invoice Generator Next.js application, including superadmin-controlled accounts, company branding, invoice creation, analytics, print/PDF export, and S3 image uploads. Use when implementing or changing this project's features or matching its invoice editor reference design.
---

# Brilliant Invoice Generator

## Product and scope

Build a full-stack invoice platform for businesses and SMEs in this project. Use Next.js 15+ App Router, strict TypeScript, Tailwind CSS, and shadcn/ui. Prefer Server Actions for authenticated form submissions and mutations. Use route handlers where an HTTP endpoint is needed, such as PDF downloads and upload callbacks.

Treat this document as implementation requirements, not evidence that features are already implemented. Inspect the repository and its installed Next.js documentation before changing code. Keep modules reusable; separate invoice editing, invoice preview, money calculations, authentication, database access, and storage integration.

The database provider, deployment target, and S3 details have not yet been supplied. Preserve existing choices when available; otherwise record an explicit implementation decision. Persistent accounts, sessions, companies, clients, and invoices require a real database; in-memory fixtures and localStorage are not production persistence.

## Visual direction

Use the user-provided InvoPilot reference image as the visual direction for the app, with Brilliant branding. The reference shows:

- A near-black workspace with charcoal cards, restrained borders, muted labels, and electric-blue primary actions.
- A compact top navigation with logo, module icons, and utility controls.
- A heading and action bar above a two-column invoice workspace: editor on the left, larger live invoice preview on the right.
- Grouped invoice details, compact labeled fields, and stacked editable billing-item cards.
- An invoice preview with a blue gradient header, sender/client details, itemized amounts, totals, and terms.

Recreate the application interface, not the photographed laptop, perspective, or surrounding background. Use readable contrast and accessible focus states even where the photograph is dim. Collapse the split view gracefully on mobile. Only display controls backed by working behavior; do not imply email delivery through a decorative Send button. Keep exported invoices legible on white A4 paper with economical ink use.

## Authentication and authorization

- No public signup, Google OAuth, or self-registration. The landing page may link to `/login` but must not offer account creation.
- Authenticate using email or phone plus password. Store securely hashed passwords and a custom signed JWT in an HTTP-only cookie. Use `Secure` in production, `SameSite`, a bounded lifetime, and server-side secret configuration. Never expose tokens to browser storage.
- Account states are `ACTIVE` and `SUSPENDED`. Verify JWT signature, expiry, account status, and session validity for every protected request. A valid signature alone does not prove current authorization.
- Use middleware or the installed Next.js version's equivalent request guard. Also enforce authorization in every Server Action, route handler, and data-access entry point; navigation guards alone are insufficient.
- Invalidate all sessions when an account is suspended or its password is reset. Use revocable sessions or a database-backed session version. Suspended sessions must be cleared and redirected to `/login?error=suspended`; APIs must return an appropriate unauthorized response.
- Ensure already-open tabs detect invalidation through a session check on focus and a bounded periodic check, or an equivalent push mechanism. Recheck authorization before any mutation.
- Protect login against brute force, use generic invalid-credentials errors, validate inputs on the server, and prevent cross-origin mutation requests. Do not log passwords, JWTs, or credentials.
- Scope company data by the authenticated user's company on the server. Never trust a client-supplied company ID or role. Explicitly validate any Superadmin cross-company operation.

| Role | Permissions |
| --- | --- |
| `SUPERADMIN` | Create and manage accounts, assign companies and roles, suspend/reactivate accounts, reset passwords, and manage system settings. |
| `COMPANY_ADMIN` | Manage their company's profile, invoices, and existing staff access within the Superadmin-controlled account policy. |
| `STAFF` | Create, view, print, and export their company's invoices; no company settings or user administration. |

All account creation remains Superadmin-only. Company staff management must not silently introduce a Company Admin signup/provisioning path or allow promotion to Superadmin. Guard against removing or suspending the last active Superadmin. Bootstrap the first Superadmin through a documented server-side command with supplied credentials, never a public setup endpoint or hardcoded password.

## Required modules

### Superadmin: `/superadmin`

- User table with name, login identifier, company, role, and account status.
- Instant Active/Suspended toggle with pending/error states, server authorization, and immediate session invalidation.
- Create-account modal: email, full name, role, company association where applicable, and a secure initial-password workflow. Support an optional unique phone number for phone login.
- Password reset action with session revocation and a secure delivery or temporary-password workflow. Do not claim email delivery unless configured.
- Record security-sensitive account changes in an audit trail without storing secrets.

### Login: `/login`

- Credentials form accepting email or phone and password, with accessible validation, pending state, and clear suspended-account feedback.
- Redirect authenticated users to the appropriate role workspace.
- Protect all application routes, including direct URLs, nested routes, Server Actions, exports, and upload endpoints. Exempt only intentionally public routes and assets.

### Company branding: `/dashboard/settings`

- Company name, address, phone, email, and Tax ID.
- Logo upload with live preview.
- Digital signature upload and drawing canvas, including clear/reset and save behavior.
- Payment QR uploads for KPay, WavePay, and bank payments, with payment labels and selection for invoices.
- Persist authorized settings changes and display saved branding in the invoice preview and exports.

### Invoice editor: `/dashboard/invoices/new`

- Sequential invoice numbers such as `INV-2026-0001`. Allocate atomically on the server with a per-company/year counter and database uniqueness constraint; never calculate the next number from the current row count.
- Existing-client selector and inline client creation, isolated to the company.
- Dynamic line items with description, quantity, unit price, and computed amount; add and remove rows.
- Shared calculation logic for subtotal, percentage or fixed discount, percentage tax/VAT, and grand total. Use decimal-safe arithmetic or integer minor units, with explicit currency precision and rounding.
- Calculate tax on the discounted subtotal unless a different business rule is supplied. Reject invalid numbers, negative prices, out-of-range percentages, excessive fixed discounts, and empty submitted invoices. Recalculate all totals on the server before saving.
- Currency selector for MMK, USD, and THB with locale-aware display. Changing currency changes the denomination; it must not imply an exchange-rate conversion.
- Payment terms, issue date, and due date picker with validation.
- Responsive live split-screen preview using reusable `InvoiceForm` and `InvoicePreview` components and shared typed data.
- Save draft, persist invoice, reopen/edit permitted invoices, and show actionable success/error states. Prevent duplicate saves and preserve entered data after failures.
- Snapshot company/client identity, branding references, line items, payment details, and financial inputs on issued invoices so later profile changes do not rewrite historical documents.

### Export, print, and sharing

- Dedicated A4 print layout using `@media print` and `@page`. Hide navigation, sidebars, form controls, buttons, and application-only surfaces when `window.print()` runs.
- Handle long descriptions and multi-page invoices, repeat item table headers where possible, avoid splitting totals/signature blocks, and preserve readable margins.
- A PDF download action must return an actual downloadable PDF. Browser print-to-PDF may remain a separate option but does not fulfill an instant download button. Choose a maintained renderer compatible with the deployment environment and match the canonical invoice layout.
- Render the selected uploaded payment QR, company logo, and signature in preview, print, and PDF. Preserve QR aspect ratio, quiet zone, and scan contrast.
- Authorize export requests against company membership; never expose private invoices by guessable IDs. Public share links or email sending are not specified and should only be added with a defined access/delivery policy.

### Invoice management: `/dashboard/invoices`

- Invoice table with useful identifying information, amounts, due dates, and filters for `DRAFT`, `UNPAID`, `PAID`, and `OVERDUE`.
- Quick authorized action to mark an issued invoice paid; record payment time and make repeated requests idempotent. Company Admin manages status changes; Staff permissions remain limited to the listed creation/view/export scope unless expanded explicitly.
- Derive overdue state consistently from an unpaid invoice's due date and the configured business timezone; drafts and paid invoices must not become overdue.
- Dashboard widgets for monthly paid revenue, total outstanding issued balance, and invoices generated. Document whether drafts are included in the count. Do not sum different currencies into one unqualified amount; group by currency unless conversion rules are provided.
- Handle empty, loading, and failure states, with pagination for growing tables.

## S3 image storage

The user will provide S3 configuration later. Build a configurable storage boundary without inventing credentials, bucket names, or production URLs.

- Document required environment variables in `.env.example`: region, bucket, and the credential mechanism. Prefer deployment IAM roles; access keys, when needed, remain server-only. Include optional endpoint/public delivery URL only if the implementation uses them.
- Keep the bucket private by default. Use short-lived presigned requests or authenticated server uploads and authorized read URLs. Scope keys to company and asset purpose with generated identifiers.
- Restrict file size and allowed image formats. Verify actual uploaded content before accepting its reference, not just filename or client-provided MIME type. Avoid unsanitized SVG uploads.
- Ensure a user cannot attach another company's object or an arbitrary external URL. Store durable object keys, not expiring signed URLs; generate fresh authorized URLs for display/export.
- Preserve assets referenced by historical invoices. Do not overwrite an old invoice's logo/signature by reusing mutable keys.
- If S3 is unconfigured, show a clear unavailable/configuration message. Do not display an upload-success state for an unpersisted file.
- Document bucket CORS requirements if the browser uploads directly. Keep secrets out of `NEXT_PUBLIC_*`, source code, and logs.

## Implementation and verification

Implement vertical workflows with persistence and authorization rather than disconnected screens. Keep database migrations, environment setup, bootstrap instructions, and run/build commands in the project README. Use explicit pending-configuration notes for external services that cannot yet be exercised.

Before claiming completion, run available type, lint, build, and focused behavior checks. Prioritize:

- Email/phone login, logout, expired/tampered tokens, password reset, and suspension of an already-authenticated account.
- Every role boundary and cross-company access attempt, including direct Server Action, export, and upload requests.
- Concurrent invoice-number allocation and duplicate submission handling.
- Percentage/fixed discounts, tax rounding, invalid quantities, and all three currencies.
- Draft/issued/paid/overdue transitions and currency-separated analytics.
- Authorized S3 upload, invalid files, branding persistence, and historical asset preservation once configuration is available.
- Desktop/mobile editor behavior, preview synchronization, multi-page A4 printing, real PDF download, and QR readability.

Report implemented behavior separately from unconfigured integrations and unrun checks. Do not describe the application as production-ready merely because its UI renders.
