# San Pya mobile / website feature map

Reviewed against the current website routes, actions, validation, and calculation
modules on 2026-10-25. This records implementation coverage, not device acceptance.

| Website capability                          | Mobile implementation                                                         | Shared source of truth                                         |
| ------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Login, expiry, suspended users/companies    | Bearer login, Keychain session, foreground refresh                            | authenticate, readSession                                      |
| Monthly revenue, outstanding, invoice count | Dashboard cards, currency selection, manual-total labels                      | mobileOverview, overviewAmounts                                |
| Revenue history, collections, priorities    | Selectable 3/6-month bars, collection progress, overdue/draft list            | dashboardInsights                                              |
| Clients                                     | Search, contact details, create from directory or invoice flow                | createClient                                                   |
| Draft/edit/issue invoices                   | Client / details / items / review wizard, due-date shortcuts, live totals     | saveInvoice, invoiceSchema, calculate                          |
| Sample product catalog                      | Add matching-currency products to line items                                  | Company.products                                               |
| Discounts, tax, terms, QR payment           | Optional adjustments and review controls                                      | InvoiceInput, calculate                                        |
| Invoice design                              | Ten templates, light/dark paper, accent color                                 | invoice-design, saveInvoiceAppearance                          |
| Preview, export, print                      | Native PDF viewer and iOS share/save/print sheet                              | Existing server PDF endpoint and web print layout              |
| Record payment                              | Confirmation restricted to company admins / owners                            | markPaid                                                       |
| Company profile and payment accounts        | Profile editor, payment account fields                                        | saveCompany                                                    |
| Logo, signature, payment QR images          | Authenticated previews, Files picker, removal, native signature drawing       | uploadAsset, existing asset route                              |
| Financial-overview adjustments              | Per-currency overrides and reset                                              | saveFinancialOverview, resetFinancialOverview                  |
| Team creation / activation / suspension     | Staff management for company admins                                           | createAccount, setAccountStatus; same 3-staff cap              |
| Platform owner login                        | Dedicated Platform tab; no tenant impersonation                               | Same SUPERADMIN role and session                               |
| Platform companies / customers / invoices   | Company profile/access, directory and invoice tracking                        | Scoped platform reads, updatePlatformCompany, setCompanyStatus |
| Platform accounts / password resets         | Create all allowed roles, suspend/reactivate, password reset                  | Existing admin actions                                         |
| Subscription plans / renewals / reporting   | Plan selection, expiry preview, history, filtering, revenue/client summaries  | plans, platformHistory, assignCompanyPlan                      |
| Audit history                               | Search and cursor pagination                                                  | Same audit query as the website                                |
| Appearance / language                       | Native light, dark, system; English/Myanmar preference                        | Existing web translation dictionary for shared labels          |
| Phone / tablet navigation                   | Bottom icon tabs on phones; sidebar at 900px; wide charts and invoice summary | Responsive React Native layout                                 |

## Synchronization

- All writes use the existing Next.js business actions and database. There is no
  duplicate mobile database and no client-side role bypass.
- Workspace data refreshes every 15 seconds while active, on foreground, by
  pull-to-refresh, and after successful mutations. Management lists refresh with
  the workspace. This is polling, not a push subscription.
- Open editors retain their local values while background data refreshes. Draft
  saves carry the original revision; conflicting saves return the existing web
  conflict error. A user must reopen a stale draft before saving it again.
- Charts use actual invoice records; manual overview totals do not alter charts.
- Existing issued invoices retain their company/client/design snapshots.
- Language and appearance preferences belong to the device. Authentication tokens
  remain in Keychain; preferences use NSUserDefaults.

## Differences and device acceptance still required

- Exact invoice preview uses the generated PDF after saving a draft. The editor's
  design swatch is a color preview, not an exact A4 preview before saving.
- Mobile JSON image uploads are limited to 2.8 MB to stay below Vercel request
  limits after base64 encoding. Images are still decoded and validated by the
  same server action. Choose images through Files or draw a signature natively.
- Shared labels use the website's Myanmar dictionary; new mobile-specific copy
  currently falls back to English. This is not complete Myanmar localization.
- Public marketing/PWA installation and the web mascot are not native business
  screens. No offline writes, push notifications, or in-app subscription purchase
  flow is introduced; plan assignment remains a platform-owner action.
- Simulator services and the configured PostgreSQL server cannot be reached from
  this sandbox. Native linking, signed device builds, Keychain, picker/signature,
  PDF preview/printing and real-database web-to-mobile workflows still need an
  acceptance run. No deployment or production database mutation was performed.

## Acceptance run

1. Start the matching Next.js backend, then rebuild with `npm run ios` in mobile.
   Metro reload alone cannot install the new native methods.
2. Company admin: edit company data on web; observe it on mobile within a poll.
   Edit on mobile and refresh web. Verify logo, signature, QR and payment details.
3. Create a client within the wizard. Confirm it is selected automatically. Save,
   preview, reopen, issue, share and mark an invoice paid; verify web matches.
4. Open one draft in both clients; save web first and confirm mobile rejects the
   stale revision without silently overwriting it.
5. Staff: confirm management tools are absent and direct privileged API requests
   return 403. Verify data stays within the authenticated company.
6. Owner: create a company/admin, assign/renew a plan, manage users and company
   access, reset a password, and inspect paginated audit events.
7. Check a small iPhone and an iPad in portrait and landscape, larger text,
   VoiceOver labels, keyboard avoidance, both themes, and empty/large datasets.
8. Test offline/retry, session expiry, and suspension while the app is active.
