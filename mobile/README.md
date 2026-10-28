# San Pya for iOS

A React Native CLI application with real native screens, an Xcode project, and
an iOS Keychain/PDF-sharing bridge. React Native 0.86.0, React 19.2.3, iOS 15.1+.
This directory belongs to the web repository: Metro imports its canonical money
functions and TypeScript models from `../src/lib`. Keep that directory structure.

## Run

Install Xcode 16.1 or newer, an iOS Simulator runtime, Node 22.11+ (the backend
requires Node 24+), and CocoaPods. From this directory:

```sh
npm ci
npm run pods
npm start
```

In another terminal in this directory:

```sh
npm run ios
```

This selects an available iOS Simulator (preferring one already booted), even
when a physical iPhone is connected. Simulator builds do not require a signing
team. To choose a specific Simulator, use
`npm run ios -- --simulator "YOUR SIMULATOR NAME"`.

Xcode 27 compatibility: CLI 20.1.0 assumes the older
`Contents/Developer/Applications/Simulator.app` location. Our launch script
checks for a relocated Simulator or `Contents/Applications/DeviceHub.app` when
that path is missing. DeviceHub opens without legacy Simulator UI arguments;
the CLI still boots and installs on the selected device through `simctl`.
If DeviceHub shows its device list, select the booted iPhone to view the app.
The compatibility shim applies only to `npm run ios`, without modifying Xcode
or installed packages.

Start the backend from the repository root with `npm run dev`, or deploy the
backend changes before connecting to an existing deployment. On the Simulator,
the app automatically connects to `http://localhost:3000`; login only asks for
email/phone and password. Configure the backend in `src/config.ts`. Set
`productionApiOrigin` to your deployed Next.js HTTPS origin before a release
build. A physical iPhone must use a reachable trusted HTTPS origin instead of
localhost (update the development origin when testing on a device).
The origin must not include a
path, query, or fragment. Release builds require HTTPS; there is no arbitrary
transport-security exception or certificate bypass.

For a physical device, open `ios/BrilliantInvoice.xcworkspace` after installing
Pods, select your Apple development team, and choose an available bundle ID
(default `com.brilliantdevstudio.invoice`). Simulator builds use ad-hoc signing for Keychain support. Device signing still
requires your own Apple development team.
The app icon derives from the existing web app icon.
After configuring signing, use `npm run ios:device` for a connected iPhone.

## Included flow

1. Sign in with an existing company-admin or staff account.
2. Overview: outstanding and lifetime paid totals, separately for MMK/USD/THB.
3. Clients: search, inspect contact information, and create clients, including
   while editing an invoice.
4. Invoices: search/filter drafts, unpaid, overdue and paid invoices; inspect
   saved invoice details.
5. Create/edit drafts with multiple line items, dates, currency, percentage or
   fixed discounts, tax after discount, terms, and configured payment QR choice.
6. Save draft or confirm issue. Issued invoices become immutable snapshots.
7. Download the canonical server-rendered PDF into the iOS share sheet to save,
   print, or share. Temporary files are removed after the sheet closes.
8. Company admins can confirm payment. Staff cannot mark invoices paid.
9. Sign out revokes the server session and clears the Keychain entry.

Company profile, branding, QR uploads, native signature drawing, invoice design,
financial overview overrides, team access, and platform-owner management are now
available in the app. Superadmins can manage companies, accounts, subscriptions,
and audit history from the Platform tab. Phone navigation uses SF Symbols; wider
tablets use a sidebar and multi-column dashboard/editor layouts.

The invoice editor has four steps with validation, automatic selection of clients
created inline, due-date shortcuts, live totals, and a review step. Saved invoices
can be opened in the native PDF viewer or shared/saved/printed using iOS.

See [FEATURE_PARITY.md](FEATURE_PARITY.md) for the researched coverage map,
synchronization behavior, differences, and device acceptance checklist.

## Authentication and API

`/api/mobile/[...path]` provides:

| Method | Endpoint          | Purpose                                                       |
| ------ | ----------------- | ------------------------------------------------------------- |
| POST   | login             | Existing login validation, throttling and revocable session   |
| GET    | session           | Recheck live account/company access                           |
| GET    | workspace         | Tenant-scoped user, company, clients, invoices, business date |
| POST   | clients           | Create client through the existing validated action           |
| POST   | invoices          | Save/issue with stable request ID and revision                |
| POST   | invoices/:id/paid | Admin-only payment recording                                  |
| GET    | invoices/:id/pdf  | Canonical authenticated invoice PDF                           |
| GET    | invoices/:id/png  | Invoice PNG for photo library / gallery                       |
| POST   | logout            | Revoke session                                                |

All routes except login require an explicit bearer token; browser cookies are
not accepted. The token uses the existing eight-hour server session and is kept
in iOS Keychain with `WhenUnlockedThisDeviceOnly`. It is never put in URLs or
plain preferences. API and PDF requests reject redirects. Server-side
AsyncLocalStorage passes the authenticated identity to existing business actions
without changing web cookie authentication. The proxy delegates only the mobile
API prefix to this route's authentication boundary.

The app refreshes workspace data every 15 seconds while active and on foreground.
Management lists refresh with the workspace; local form edits are retained.
Expired/revoked sessions clear company data and return to sign-in. Network errors
retain the current screen with retry. Logout requires server connectivity so
session revocation can be confirmed. Drafts remain in memory until saved; closing
the editor asks for confirmation. After a revision conflict, close the editor,
refresh and reopen the saved draft. There is no automatic merge of competing edits.

PDFs require the backend's normal Chromium, APP_URL, and private asset setup.
The native PDF viewer uses the canonical web invoice design and demo watermark.
Save a draft before opening the exact PDF preview. The native share sheet requires a live device
or Simulator; it cannot be checked with TypeScript alone.

## Verification

```sh
npm run typecheck
npm test
```

From the repository root:

```sh
npm run typecheck
npm run lint
npm test
```

The focused mobile API tests mock persistence/session boundaries to test cookie
rejection, bearer routing, company context isolation under concurrency, role
checks, input validation, and logout. Existing integration tests exercise real
session revocation and invoice actions with isolated PostgreSQL schemas.

Validation includes mobile and backend TypeScript, focused API/flow/money tests,
backend ESLint, Metro bundling, and Objective-C++ syntax checks. Full simulator
build/run and live PostgreSQL verification are blocked by sandbox access. These
checks do not replace the device acceptance run in FEATURE_PARITY.md.

Device acceptance checks:

- Sign in as staff/admin; suspend/reset the active account from the web and
  confirm the app returns to login; confirm a different company sees no prior data.
- Create a client, save/reopen a multi-line draft, change it on the web, and check
  revision conflicts. Verify mixed currencies, rounding, and Yangon overdue dates.
- Issue, share a branded PDF with payment QR, cancel sharing, and share again.
- Confirm only admins can record payment and that all screens refresh afterward.
- Test a small iPhone and iPad with keyboard, larger text, VoiceOver, background /
  foreground, unavailable network, and expired session.
- Configure signing, archive a Release build, and complete App Store privacy
  disclosures against actual server data handling before distributing.
