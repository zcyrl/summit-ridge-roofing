# Roofing website template — Whop Websites

A production-shaped, reusable one-page site for a US roofing company. It sells
three real Whop plans, collects leads, tracks the funnel, saves a card at the
deposit checkout, and creates the final-balance invoice from an owner-only
tool.

Built on the stack the Whop Websites quickstart scaffolds: **TanStack Start +
Vite + React**, deployed to a `whop.site`/custom domain with the Whop CLI.

- One-page marketing site + `/checkout/:plan` + `/checkout/return` +
  `/admin/invoice`
- Light/dark theme, one theme at a time, CSS variables, saved to localStorage
- Whop Payments only. No Stripe, no PayPal, no custom card form.
- `CheckoutElement`’s sibling `ExpressCheckoutElement` for wallets, and
  `PaymentElement` + `BrandingElement` for the card form
- Instant estimator, ZIP checker, before/after wipe, project tracker,
  financing callout, reviews, lead form
- `whop.track` custom events with a development event panel
- Whop Invoices API with auto-charge or manual email

---

## 1. The only file to reskin

Everything a roofing company would change lives in **`config/site.ts`**:

- company name, logo words, phone, email, licence, warranty, hours, address
- service area (cities + ZIP list), radius, response time
- services, copy, prices and plan keys
- Whop plan IDs, account ID and product ID
- estimator square-foot range and per-square-foot material rates
- project tracker steps and current step
- financing copy and providers
- reviews
- image slots
- both colour themes
- SEO title/description
- tracking event names

Change values there. Do not change component structure to change copy or
prices. If you add a fourth service, add it to `site.services`; the grid maps
over the array.

### Images

Put files in `public/images/` and set the paths in `site.images`:

```ts
images: {
  hero: { src: "/images/hero.jpg", alt: "...", label: "..." },
  gallery: [{ src: "/images/project-1.jpg", alt: "...", label: "..." }],
  before: { src: "/images/before.jpg", ... },
  after: { src: "/images/after.jpg", ... },
}
```

Leave a path as `""` to keep the built-in line-art fallback. Photos are rendered
with a monochrome treatment so mixed phone photos still look like one set.

### Theme

`site.colors` holds both palettes and the shared orange. The app injects them as
CSS variables, so both themes are wired everywhere. The toggle:

- defaults to `prefers-color-scheme`
- writes `roofing-theme` to localStorage on an explicit choice
- keeps following the OS until the visitor chooses
- is a real button with `role="switch"` and `aria-checked`

No black-and-white split layout: the entire page changes theme together.

---

## 2. Local development

```bash
npm install
cp .env.example .env
npm run dev
```

To click through the whole UI **without Whop credentials**, set this in `.env`:

```dotenv
WHOP_DEMO_MODE=1
ADMIN_KEY=dev-admin
```

The server routes simulate Whop responses in demo mode. Whop Elements is tied
to the deployed app domain, so a localhost checkout shows a labelled demo notice
instead of an empty form. The estimator, theme, ZIP checker, lead form and admin
UI still work. Use the live `whop.site` URL for the payment-form recording.

### Recording demo data

This checkout is currently populated with Denver demo data so it can be recorded
without editing anything. The full shot list, exact field values and external
links are in **`DEMO-VIDEO-GUIDE.md`**. Ask for the demo data to be removed
before this is pitched to a real roofing company.

For real local payments, use the Whop CLI so it injects the same environment the
hosted runtime provides:

```bash
whop login
whop apps dev
```

`whop apps dev` injects `WHOP_APP_ID`, a short-lived `WHOP_API_KEY`,
`WHOP_ACCOUNT_ID` and your app secrets. Plain `npm run dev` needs a `.env` with
the variables listed at the bottom of this file.

---

## 3. Whop setup

### 3.1 Create the app and claim a domain

```bash
curl -fsSL https://whop.com/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"
whop login
whop quickstart

# Run this in the parent folder, or anywhere outside this template.
whop apps init --name "Your Roofing" --domain your-roofing --app_type website --dir your-roofing-live
```

`whop apps init` registers the app, claims `your-roofing.whop.site` (or the
domain you pass), scaffolds a project and writes `whop.app.json`. Copy this
template over that scaffold, **keeping `whop.app.json`**:

```bash
rsync -a --exclude node_modules --exclude dist --exclude .git --exclude whop.app.json \
  "/absolute/path/to/this/template/" "/absolute/path/to/your-roofing-live/"
cd /absolute/path/to/your-roofing-live
npm install
```

If you already have a website app, you can link this directory directly:

```bash
whop apps deploy --app app_xxxxxxxx
```

### 3.2 Create the three plans

```bash
npm run plans:create            # prints the plan_… IDs
npm run plans:create -- --write # also writes them into config/site.ts
```

The script creates one product and three one-time variants:

| Config key | Default name | Price |
| --- | --- | --- |
| `inspection` | Roof inspection | $149 |
| `deposit` | Project deposit | $500 |
| `tuneUp` | Gutter and flashing tune-up | $399 |

It reuses a product/variant with the same title, so re-running is safe. If you
prefer the dashboard, create three one-time plans and paste the `plan_…` IDs
into `config/site.ts`.

### 3.3 Point the site at your account

- On `whop.app` hosting, `WHOP_ACCOUNT_ID` is injected, so the checkout gets the
  right account automatically.
- Locally, set `WHOP_ACCOUNT_ID=biz_…` in `.env`.
- `config/site.ts > whop.accountId` is only a fallback. The checkout route reads
  the server value first.

`config/site.ts > whop.productId` is optional; it powers the pixel product
attributes on the service cards. The plans script writes it for you.

### 3.4 API permissions

The server calls Whop with the platform-injected key on `whop.app`. If you use a
key of your own, grant the scopes these routes use:

- `member:basic:read`, `member:email:read`, `member:create` (lead record)
- `event:create` (server-side `lead` event)
- `payment:charge` (create the payment, charge an invoice)
- `invoice:create`, `invoice:update`, `invoice:read` (final balance)
- `plan:create` (an inline variant for the final balance)
- `payment:read` (return page and deposit lookup)

If a call returns a scope error, the UI shows the message. The wrapper is
`src/lib/whop.server.ts`; every Whop HTTP call lives there.

### 3.5 Secrets

```bash
whop apps secrets set --secret ADMIN_KEY=replace-with-a-long-random-string
whop apps secrets set --secret WHOP_DEMO_MODE=0
whop apps secrets list
```

`WHOP_API_KEY`, `WHOP_ACCOUNT_ID` and `WHOP_API_ORIGIN` are reserved/injected on
Whop hosting. Do not set them as app secrets.

### 3.6 Apple Pay / Google Pay

Wallet buttons need Apple Pay enabled on the site's domain. On `whop.site` the
domain is managed by Whop; for a custom domain, add it through the Domains API
or the dashboard before recording the express-checkout step. Google Pay is
subject to Google's own terms for your site. The element hides wallets the
device or the account cannot support.

---

## 4. How checkout works

### Deposit — $500 + card on file

Route: `/checkout/deposit`

- `Payments` + `EmailElement` + `PaymentElement` + required `BrandingElement`
- `setupFutureUsage="off_session"` tells Whop the buyer consented to the method
  being saved for the final balance
- The browser gets a single-use confirmation token; the server creates the
  payment with `POST /payments`
- On success, the payment carries `member_id` and `payment_method_id`; the
  confirmation page shows both so the owner can create the final invoice
- `deposit_started` fires when the configured deposit checkout mounts

Express wallets are intentionally **not** used on the deposit page: Whop's
`ExpressCheckoutElement` cannot finish a setup/save flow, so using it here would
silently skip the card-on-file requirement. `PaymentElement` still offers Apple
Pay and Google Pay as method tiles for the deposit.

### Inspection and tune-up — one-time

Routes: `/checkout/inspection`, `/checkout/tune-up`

- `ExpressCheckoutElement` renders the device's native Apple Pay / Google Pay
  buttons and completes the whole checkout in the sheet
- `PaymentElement` renders the card / other methods below it; its wallet tiles
  are disabled with `wallets={{ applePay: "never", googlePay: "never" }}` so the
  buyer never sees two sets of wallet buttons
- Both groups mount under one `WhopElements` provider
- Whop's checkout completion and page views are automatic; the app does not
  duplicate them

### The decorative card

`src/components/checkout/DecorativeCard.tsx` is **not a card form**. It is a
visual made of divs and SVG. It never reads a card number, expiry or CVC. The
only data it receives is from Whop's `PaymentElement.onChange`: card network,
last four, display name, completeness, plus errors from `onError`. The full card
number, expiry and CVC are never exposed to the host page; mirroring the full
number would require replacing Whop Elements with a custom card form, which the
brief rules out. Card input stays inside Whop's PCI-isolated iframe.

The card has front and back faces. Because the web `PaymentElement` exposes no
per-field focus event, the template cannot flip on CVC focus; the accessible
**View back** button is the documented fallback. The code has a `// VERIFY:`
note for this. If Whop adds a focus event, wire it there.

### Return page

`/checkout/return?plan=…&payment=pay_…&status=…` reads `status` before showing a
success face, then fetches the payment server-side (never trusts the URL alone)
to display the amount, member ID, saved method and card label. It is a receipt
display, not fulfillment. For production, fulfillment belongs in a
`payment.succeeded` webhook; this template deliberately does not fake proof of
payment from the query string.

### Final balance

`/admin/invoice` (owner-only, `noindex`):

1. Enter `ADMIN_KEY`.
2. Paste the deposit payment ID and press **Load details** to fill member,
   saved method and email.
3. Enter the job total; the preview subtracts the $500 deposit.
4. Choose:
   - **Charge saved card now** — create draft invoice, issue it, then call
     `/invoices/:id/charge`; or
   - **Email the invoice link** — create, issue and send the invoice.
5. The status card shows invoice number, status, amount due, payment link and
   scheduled/paid timestamps. **Refresh status** re-reads the invoice.

Auto-charge is asynchronous. A `pending`/`open` status right after the call is
normal; Whop settles it and emails the buyer. The route runs only on the server.

The admin page is protected by a shared key in `ADMIN_KEY`, which is enough for
a template demo. Put it behind Whop OAuth or your own session before giving it
to a real office team.

---

## 5. Leads and tracking

### Lead form

`POST /api/estimate` validates the form and calls `createLead()` in
`src/lib/whop.server.ts`.

> **VERIFY:** Whop's public Current API has no `/leads` endpoint. The wrapper
> uses the documented equivalent: `POST /members` creates the CRM record, then
> `POST /events` records a `lead` event with the form's email/phone/ZIP. If Whop
> ships a dedicated Leads API, replace only `createLead()`.

The client fires `estimate_requested` only after the server confirms the member
was created. It passes the lead/member reference as `event_id` so a retry does
not double-count.

### Custom events

| Event | Where |
| --- | --- |
| `estimate_requested` | after the lead form succeeds |
| `service_viewed` | first view/click of each service card, and first use of the estimator |
| `deposit_started` | when the configured deposit checkout mounts |

Page views, checkout views and purchases are automatic on `whop.app`; the app
does not call them again.

### Event panel

Every event goes through `track()` in `src/lib/tracking.ts`, which forwards to
`window.whop.track`, mirrors to the panel and never throws if the pixel is
blocked.

- always on in dev
- on a live site, add `?events=1` to the URL for the recording
- the panel can be collapsed and cleared

---

## 6. Deploy

```bash
cd /absolute/path/to/your-roofing-live
npm run typecheck
whop apps deploy
```

`whop apps deploy` builds, typechecks, uploads and promotes. The Vite plugin
packs the archive. `vite.config.ts` includes a tiny adapter that renames
TanStack Start's `dist/server/server.js` entry to the `dist/server/index.js`
name Whop hosting expects; without it the Whop pack step rejects the build.

Useful follow-ups:

```bash
whop apps logs app_xxxxxxxx --level error
whop apps deploy --preview
whop apps builds promote abld_xxxxxxxx
whop domains get your-roofing.whop.site
```

Check the live URL:

```bash
curl -I https://your-roofing.whop.site
```

The exact URL is the domain you claimed in `whop apps init`.

---

## 7. Verification notes / assumptions

- **No public Leads API.** See above. The Member + `lead` Event path is fully
  documented and isolated in one function.
- **Express + setup are mutually exclusive per Whop docs.** Deposit uses
  `PaymentElement` with save consent; one-time plans use
  `ExpressCheckoutElement` + `PaymentElement`.
- **Per-field focus events are not exposed by the web PaymentElement.** The card
  has a manual, accessible front/back control. `// VERIFY:` comment in
  `DecorativeCard.tsx`.
- **No database.** The confirmation page surfaces the payment, member and saved
  method IDs for the admin tool. A production deployment should persist those
  from `payment.succeeded` / `setup_intent.succeeded` webhooks instead of asking
  the owner to copy them.
- **Sandbox and production are separate.** Whop sandbox keys, accounts, plans
  and elements environment do not share data. The template uses one config; use
  a branch/env pair per environment and never paste a production key into a
  sandbox test.
- **Demo mode** simulates server responses. It cannot mount real Elements; the
  checkout page says so. Use a real account for the payment recording.
- **`whop.app` is an alias, not the canonical host.** Whop resolves the app's
  `.whop.app` hostname and 307-redirects it to `.whop.site`. The app type is
  already `website`; changing it to `b2c_app` would change the product model, not
  the suffix. A connected custom domain is the only branded canonical URL.
- **Invoice issue/send/charge requires business verification.** Draft creation
  works, but Whop returns “Complete account verification before issuing an
  invoice” until the account is verified. The admin UI shows that warning rather
  than hiding it.
- The sample copy, reviews, placeholders and line art are template content.
  Replace them before pitching a real business.

---

## 8. Environment values

Only these are read from the environment:

```dotenv
WHOP_API_KEY=
WHOP_ACCOUNT_ID=
WHOP_API_ORIGIN=https://api.whop.com
WHOP_API_VERSION=2026-11-13-1
ADMIN_KEY=
WHOP_DEMO_MODE=0
```

`WHOP_API_KEY` is only needed for local `npm run dev` / the plan script; on
Whop hosting the platform injects it. `WHOP_API_ORIGIN` should be
`https://sandbox-api.whop.com` for a sandbox-only local test. Keep
`WHOP_DEMO_MODE=0` for anything a buyer can reach.
