# Submission notes — Summit Ridge Roofing on Whop

## Live demo

https://summitridge-579640.whop.site

Source: https://github.com/zcyrl/summit-ridge-roofing

This is a working, config-driven roofing website template. It is not a mock-up:
the three plans below are real Whop plans, the lead form creates a real Whop
member, and the owner invoice tool calls the Whop Invoices API.

| Plan | Price | Whop plan ID |
|---|---:|---|
| Roof inspection | $149 | `plan_34sDfuszLWnWL` |
| Project deposit | $500 | `plan_Xw1a8KnMWdNbo` |
| Gutter and flashing tune-up | $399 | `plan_uUUc8dCqOdOPP` |

Product: `prod_QNRGg5f3qGSQv` · Account: `biz_Oo6o9s3OtujsE9`

These are public identifiers (they are already present in the browser bundle and
checkout URLs). No API key or admin secret is in this repository.

---

## What the reviewer needs

A roofing company — or Whop reviewing the submission — needs to see the whole
job, not a gallery of screenshots:

1. A public site that looks like a real roofing business.
2. A quote path that turns an estimate into a lead.
3. A checkout that uses Whop Payments only.
4. A deposit that saves a card for the final balance.
5. A final invoice that can charge the saved card or email a link.
6. Proof that the three required events fire.
7. A template a roofer can reskin from one config file.
8. Source code that can be reviewed without leaking secrets.

Everything above is supplied. The recording guide is in
[`DEMO-VIDEO-GUIDE.md`](./DEMO-VIDEO-GUIDE.md).

---

## What I did, and how

### 1. Built the site

- TanStack Start + Vite + React, the stack the Whop Websites quickstart uses.
- One-page marketing site with emergency strip, header, hero, estimator,
  services, before/after, tracker, ZIP checker, financing, reviews, lead form,
  footer and mobile sticky bar.
- All content, prices, colours, plan IDs, service area, reviews and image slots
  live in `config/site.ts`.
- Light/dark theme uses CSS variables, `prefers-color-scheme`, localStorage and
  a real `role="switch"` button. One theme at a time.

### 2. Wired Whop

- Created the product and the three real plans with the Whop CLI.
- Put the IDs in `config/site.ts`; the browser reads the public account/plan IDs
  from the server loader, never from a secret.
- Checkout uses `WhopElements` with `PaymentElement`, `BrandingElement` and
  `ExpressCheckoutElement` (wallets on one-time plans).
- The deposit checkout uses `setupFutureUsage="off_session"` so Whop saves the
  card for the final balance.
- The decorative card is cosmetic; it receives only network, last four, display
  name, completeness and errors from `PaymentElement.onChange`.

### 3. Lead capture

- `/api/estimate` validates the form and calls `createLead()` in
  `src/lib/whop.server.ts`.
- Whop's public Current API has no `/leads` endpoint. The implementation uses
  the documented equivalent: `POST /members` creates the member, then
  `POST /events` records a `lead` event with the form details. This is marked
  `// VERIFY:` in one isolated function.
- The client fires `estimate_requested` only after the server confirms the lead.

### 4. Final invoice

- `/admin/invoice` is an owner-only, `noindex` page protected by `ADMIN_KEY`.
- It looks up a deposit payment, fills the member ID and saved payment method,
  subtracts the $500 deposit, and creates the invoice.
- Two modes: charge the saved card off-session, or issue and email the invoice
  link.
- The status card shows the invoice number, status, amount due and payment link.

### 5. Tracking

- `estimate_requested` — after a lead is created.
- `service_viewed` — first view/click of each service card and first use of the
  estimator.
- `deposit_started` — when the configured deposit checkout mounts.
- `?events=1` opens the on-page event log. It is always on in development.

### 6. Demo data for recording

`config/site.ts` currently uses Denver demo data: Summit Ridge Roofing LLC,
(303) 555-0148, 4120 Brighton Blvd, CO-RC-48219, Denver-area cities and ZIPs,
three named reviews, and a $14,250 invoice example. The exact values are in the
recording guide.

The demo data is intentionally editable. It is not wired into the code.

### 7. Demo mode

`WHOP_DEMO_MODE=1` simulates server writes so the lead form, invoice tool and
event log can be recorded without touching a real account. It does not simulate
a payment. Whop Elements is tied to the deployed app domain, so localhost shows
a labelled notice; the live checkout shows the real card form. No card is ever
charged in demo mode.

---

## Requirement map

Source of requirements: the original brief supplied with the project.

| Requirement | Status | Where |
|---|---|---|
| Production-ready reusable roofing template | Met | whole repo |
| Whop Websites + live URL | Met, with host caveat | https://summitridge-579640.whop.site |
| Whop Payments only; no Stripe/PayPal/custom card form | Met | checkout uses Whop Elements only |
| All business content in one config file | Met | `config/site.ts` |
| Theme toggle, one theme, localStorage, prefers-color-scheme | Met | `src/lib/theme.tsx`, `ThemeToggle.tsx` |
| Exact light/dark palette and orange accent | Met | `site.colors`, `themeCss()` |
| Instrument Serif / Inter Tight / DM Mono, headline sizes | Met | `src/styles.css` |
| CSS-only motion, reduced-motion support | Met | `src/styles.css` |
| Image slots + SVG fallbacks | Met | `site.images`, `ImageSlot.tsx` |
| Sections 1–13 from the brief | Met | `src/routes/index.tsx` and `src/components/sections/` |
| Estimator range, material chips, prefill, tracking | Met | `Estimator.tsx` |
| Services with line icons, prices, booking, tracking | Met | `Services.tsx` |
| Before/after wipe | Met | `BeforeAfter.tsx` |
| Project tracker | Met | `Tracker.tsx` |
| Service area + ZIP in/out states | Met | `ServiceArea.tsx` |
| Financing callout, no custom form | Met | `Financing.tsx` |
| Reviews from config | Met | `Financing.tsx` |
| Lead form with validation, loading, success, error | Met | `EstimateForm.tsx`, `/api/estimate` |
| Footer and mobile sticky bar | Met | `Footer.tsx`, `MobileBar.tsx` |
| Checkout routes for each plan | Met | `/checkout/inspection`, `/checkout/deposit`, `/checkout/tune-up` |
| PaymentElement / ExpressCheckoutElement / BrandingElement | Met | `CheckoutClient.tsx` |
| Decorative card, ISO ratio, chip, contactless, front/back | Met | `DecorativeCard.tsx` |
| Card never read/captured by the page | Met | Whop iframe isolation |
| Real $149 / $500 / $399 plans | Met | plan IDs above |
| Deposit saves card for final balance | Met (code); live charge needs account verification | `setupFutureUsage` |
| Final invoice auto/manual with status | Met (code); live issue blocked by verification | `/admin/invoice`, `/api/admin/invoice` |
| `estimate_requested`, `service_viewed`, `deposit_started` | Met | `src/lib/tracking.ts` |
| Dev event panel | Met | `?events=1` |
| Accessibility: labels, focus, 44px targets, keyboard | Met | forms, toggle, menu |
| Fully responsive | Met | tested at 390 px; no horizontal overflow |
| Script to create plans | Met | `scripts/create-plans.ts` |
| README reskin instructions | Met | `README.md` |
| Env values documented | Met | `.env.example`, README |
| Plan/project submission package | Met | this file + guide + repo |
| Canonical `whop.app` URL | Not possible on the platform | 307 redirects to `.whop.site` |
| Full card number mirrored on the decorative card | Not possible with Whop Elements | only network + last four are exposed |
| Live invoice issue/send/charge | Blocked by Whop account verification | draft creation works; issue returns the verification error |

---

## Known limitations, stated plainly

### `whop.app` redirects to `whop.site`

`https://summitridge-579640.whop.app` resolves but returns a **307** to
`https://summitridge-579640.whop.site`. The app type is already `website`, which
is correct for a public marketing site. Changing it to `b2c_app` would change
the product model, not the hostname suffix. The only branded canonical URL is a
connected custom domain.

### The decorative card cannot mirror the full number

Whop Elements renders the card fields inside a cross-origin, PCI-isolated
iframe. The host page receives only network, last four, display name,
completeness and errors. The full number, expiry and CVC are never available.
Mirroring them would require a custom card form, which the brief rules out.
This is a deliberate security boundary, not a missing feature.

### No public Leads API

Whop's Current API does not expose `/leads`. The lead is a Whop member plus a
`lead` event. The workaround is isolated in `createLead()` and marked
`// VERIFY:`.

### Invoice issuance is gated by account verification

The live account can accept card payments but has not completed business
verification. Creating a draft invoice succeeds; issuing, sending or charging
returns:

> Complete account verification before issuing an invoice

The admin UI surfaces that warning. Complete verification in Whop before
recording the live invoice step.

---

## Security notes

- `WHOP_API_KEY`, `ADMIN_KEY` and `WHOP_DEMO_MODE` are read from the server
  runtime only. No secret is in `config/site.ts`, the browser bundle or this
  repository.
- `.env` is gitignored; only `.env.example` is committed.
- The public account, product and plan IDs are identifiers, not credentials.
- The admin page uses a shared key. For a real office, put it behind Whop OAuth
  or a session and rotate the key.
- No real card data is stored by this app. Whop stores the payment method; the
  app reads only the IDs it needs for the invoice tool.
- The test lead and draft invoice created during verification are documented as
  test records and should be deleted before handoff.

---

## How to verify in five minutes

1. Open https://summitridge-579640.whop.site.
2. Toggle light/dark; reload; the choice persists.
3. Drag the estimator to 2,200 sq ft and choose Metal. The range updates.
4. Check ZIP `80207` (served) and `90210` (outside area).
5. Submit the estimate form once. The success state shows a member reference.
6. Open `?events=1`; confirm `estimate_requested` and `service_viewed`.
7. Open `/checkout/deposit`. Confirm Whop card fields, branding and saved-card
   consent. Do not submit unless you intend to charge.
8. Open `/admin/invoice` on the live site. The page renders; invoice issue is
   gated by verification.
9. For the invoice demo, run locally with `WHOP_DEMO_MODE=1 ADMIN_KEY=dev-admin`
   and open `/admin/invoice?demo=1`.

---

## Recording links

All links, field values, shot order and the tone paragraph are in
[`DEMO-VIDEO-GUIDE.md`](./DEMO-VIDEO-GUIDE.md).
