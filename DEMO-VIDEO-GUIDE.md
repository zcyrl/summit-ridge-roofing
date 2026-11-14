# Summit Ridge Roofing — recording guide

This is the shooting script for the Whop submission video. It is written to be
read once, then used as a shot list. The demo data is already in
`config/site.ts`; no code changes are needed before recording.

---

## 1. Tone (read this before you hit record)

I’m talking to a neighbor, not pitching a startup. I know roofs, I know what a
storm does to a family’s week, and I know people hate being sold to. So I keep it
plain: here’s what we do, here’s what it costs, here’s how you book it, here’s
what happens after. I point at the screen instead of reading it. If something is
a demo, I say so. If something isn’t finished, I say that too. The confidence
comes from the work, not the voice. The goal is that someone watches once and
knows exactly how to request a quote, pay a deposit, and get the final invoice.

---

## 2. Before you record

1. Open Chrome. Use a clean window, 1440 × 900 or 1920 × 1080.
2. Close unrelated tabs. Hide bookmarks if you can.
3. Have two tabs ready:
   - **Live site** — https://summitridge-579640.whop.site
   - **Local demo** — http://localhost:3000 (run `WHOP_DEMO_MODE=1 ADMIN_KEY=dev-admin npm run dev`)
4. In the live tab, use the real production site. In the local tab, use demo mode
   for the invoice and event panel. The local checkout cannot mount Whop Elements
   because Elements is tied to the deployed app; that is expected.
5. Do not enter a real card on camera. Do not click “Pay” on the live checkout
   unless you intend to charge the card.
6. Record in 2–4 short takes, not one long take. Stop between sections. It makes
   retakes cheap.

### What to open, in order

| Order | Tab | URL |
|---|---|---|
| 1 | Live home | https://summitridge-579640.whop.site |
| 2 | Live events panel | https://summitridge-579640.whop.site/?events=1 |
| 3 | Live deposit checkout | https://summitridge-579640.whop.site/checkout/deposit |
| 4 | Live deposit + events | https://summitridge-579640.whop.site/checkout/deposit?events=1 |
| 5 | Live inspection checkout | https://summitridge-579640.whop.site/checkout/inspection |
| 6 | Live tune-up checkout | https://summitridge-579640.whop.site/checkout/tune-up |
| 7 | Local estimate form, prefilled | http://localhost:3000/?demo=1#estimate |
| 8 | Local invoice tool, prefilled | http://localhost:3000/admin/invoice?demo=1 |
| 9 | Local events panel | http://localhost:3000/?events=1 |
| 10 | Local success screen preview | http://localhost:3000/checkout/return?plan=deposit&payment=pay_demo_recording&status=succeeded |

Optional proof that the plans are real:
- Whop product page: https://whop.com/summit-ridge-roofing-dd-95da/
- Whop-hosted deposit checkout: https://whop.com/checkout/plan_Xw1a8KnMWdNbo
- Whop-hosted inspection checkout: https://whop.com/checkout/plan_34sDfuszLWnWL
- Whop-hosted tune-up checkout: https://whop.com/checkout/plan_uUUc8dCqOdOPP
- Whop dashboard: https://whop.com/dashboard
- Whop invoices: https://whop.com/dashboard/invoices
- Whop members: https://whop.com/dashboard/members

> Whop’s dashboard navigation changes. If a link 404s, open the dashboard and use
> the left sidebar. The CLI commands in section 7 always work.

---

## 3. The script

### Shot 1 — Cold open on the live home page (0:00–0:20)

**On screen:** Live home page, top of page. Let the hero animation run for a
second before talking.

**Say:**

> “This is Summit Ridge Roofing. One page, no app to install. A customer can get a
> price, book a job, pay a deposit, and follow it through to the final invoice.
> Everything you see is driven by one config file. I’ll show you the customer side
> first, then the owner side.”

**Do:** Scroll slowly from the emergency strip to the hero. Do not scroll fast.

---

### Shot 2 — Theme toggle (0:20–0:35)

**On screen:** Header theme toggle.

**Say:**

> “One theme at a time — light or dark, never a split layout. It remembers what
> you picked. If you never touch it, it follows the phone or laptop setting.”

**Do:** Toggle to dark. Pause. Toggle back to light. Reload the page to prove it
sticks.

---

### Shot 3 — Instant estimator (0:35–1:05)

**On screen:** Estimator card under the hero.

**Say:**

> “This is the instant estimate. Drag the roof size, pick the material. The range
> comes from the per-square-foot rates in the config — it’s not a fake number.
> If they want the exact number, this button carries the size and material into
> the form below.”

**Do:** Set the slider to **2,200 sq ft**. Click **Metal**. Let the range update
(about **$19,800–$28,600**). Click **Request exact quote** and show the form
notes being filled. If the events panel is open, point at `service_viewed`.

---

### Shot 4 — Services (1:05–1:20)

**On screen:** Three service cards.

**Say:**

> “Three things we sell: repair, replacement, inspection. Each card books the
> right Whop plan. The price on the card is the price the checkout uses — there’s
> no second price hidden in the payment page.”

**Do:** Hover a card, then click **Book** on one card and show the matching
checkout route. Go back.

---

### Shot 5 — Before / after (1:20–1:35)

**On screen:** Before/after wipe.

**Say:**

> “Drag it. This is where real project photos go. The template ships with line art
> so it still looks finished before a roofer has photos. Drop the files in
> `/public/images`, put the paths in the config, and the same section uses them.”

**Do:** Drag the handle from left to right and back once.

---

### Shot 6 — Project tracker (1:35–1:50)

**On screen:** Tracker card next to the before/after.

**Say:**

> “After the deposit, the customer sees this: deposit paid, scheduled, roofing,
> final invoice. The current step pulses. It’s the same language the office uses,
> so nobody has to translate ‘where are we?’ on a phone call.”

**Do:** Point at the pulsing step. Do not scroll past it too quickly.

---

### Shot 7 — Service area and ZIP checker (1:50–2:10)

**On screen:** Service area card.

**Say:**

> “The ZIP checker is a real check against the ZIP list in the config. `80207` is
> in. A ZIP outside the list gets a callback offer instead of a dead end.”

**Do:** Type **80207**, click **Check ZIP**, show “We serve you.” Then type
**90210**, click **Check ZIP**, show “Outside our area” and the callback link.

---

### Shot 8 — Financing and reviews (2:10–2:30)

**On screen:** Financing card and reviews.

**Say:**

> “Financing is not a form on this site. Klarna, Afterpay and Splitit appear in
> the Whop checkout when the merchant is approved. We never collect credit
> details here. The reviews are demo reviews — names and cities are in the config,
> one edit each.”

**Do:** Scroll through the financing card and the three review cards.

---

### Shot 9 — Estimate form (2:30–3:05)

**On screen:** Local prefilled form (or live form, typed).

**Say:**

> “This is the lead form. Name, phone, email, property address, ZIP, service,
> notes. On submit it creates a Whop member and a lead event — it doesn’t just
> send an email into a void. Then it fires `estimate_requested`.”

**Do:** Use `http://localhost:3000/?demo=1#estimate` to show a filled form. Click
**Send request**. Show the success state and the reference.

**If recording live:** type the same values, submit once, and show the real
reference. That creates a real test member in Whop; name it clearly (Dana
Whitfield) so you can delete it later.

---

### Shot 10 — Whop checkout (3:05–3:45)

**On screen:** Live `/checkout/deposit`.

**Say:**

> “This is the actual Whop checkout. The card fields are inside Whop’s secure
> iframe — this page never sees the number, expiry or CVC. The deposit saves the
> card for the final balance. The customer approves the balance before it’s
> charged. The card on the left is decorative; it can only mirror the network and
> last four that Whop exposes. The full number cannot be mirrored by any site that
> uses Whop Elements, and that’s deliberate PCI isolation.”

**Do:** Open this tab 10–15 seconds before you roll and wait until the email,
card and branding fields are visible. Whop Elements can take a few seconds, and
ad blockers can delay it. If the fields stay blank, reload with extensions off.
Hover the card, show the flip control, point at the Whop branding and the card
fields. **Do not submit a payment.** If you want to show the saved-card consent,
point at the line above the Pay button.

> Show the same pattern on `/checkout/inspection` and `/checkout/tune-up` if you
> have time. On those, the express wallet block appears above the card form.

**Optional mobile shot (15 seconds):** Switch the live tab to a 390 px viewport
or use your phone. Open the menu, show the sticky Call / Get estimate / Book
$149 bar, then open the deposit checkout to show the stacked card and form.
That is the responsive proof.

---

### Shot 11 — Success screen preview (3:45–3:55)

**On screen:** Local success preview URL.

**Say:**

> “This is the screen after a successful deposit. It shows the plan, the amount,
> the email, and the payment, member and saved-card IDs the office needs for the
> final invoice. On the live site this page is reached after Whop confirms the
> payment.”

**Do:** Open the local preview URL. Point at the IDs. Do not claim it was a real
charge; the URL is clearly a preview.

---

### Shot 12 — Final invoice, owner side (3:55–4:35)

**On screen:** Local `/admin/invoice?demo=1`.

**Say:**

> “This is the owner-only invoice tool. The balance is the job total minus the
> five-hundred-dollar deposit. Here the job total is fourteen thousand two hundred
> and fifty, so the balance is thirteen thousand seven hundred and fifty. You can
> charge the saved card from the deposit, or email a secure Whop invoice link.
> The status stays on screen so the office can see what happened.”

**Do:** Type the local admin key **`dev-admin`**. Point at the prefilled customer,
member and saved-card IDs. Click **Create and email**. Show the invoice number,
status, balance and the warning banner.

> The warning is expected on the live account right now: Whop requires business
> verification before it will issue, send or charge an invoice. Say that plainly.
> Do not hide it. The code path is complete; the account gate is external.

---

### Shot 13 — Events (4:35–4:55)

**On screen:** Local `/?events=1` or live `/?events=1`.

**Say:**

> “These are the custom events from the brief: `estimate_requested`,
> `service_viewed`, `deposit_started`. Page views and checkout events are
> automatic in Whop, so we don’t duplicate them. This panel is a recording aid;
> it is only on in development or with `?events=1`.”

**Do:** Trigger the estimator and a service card, then open the **live** deposit
checkout with `?events=1`. The live checkout mounts Whop Elements and fires
`deposit_started`; the local demo checkout only shows the labelled notice, so
the event does not fire there. Show all three event rows.

---

### Shot 14 — Close (4:55–5:15)

**On screen:** Live home page, then the config file on GitHub.

**Say:**

> “The live site is summitridge-579640.whop.site. The code is in the public repo.
> The plans are real Whop plans, the leads are real Whop members, and the theme,
> prices, service area, reviews and copy all come from one config file. If you’re
> a roofer, you change that file and deploy. If you’re Whop, the checkout,
> tracking and invoice flow are already wired.”

**Do:** Show the repo’s `config/site.ts` file. End on the live URL, not a talking
head.

---

## 4. Demo data card (use these exact values)

| Item | Demo value |
|---|---|
| Company | Summit Ridge Roofing LLC |
| Phone | (303) 555-0148 |
| Email | hello@summitridgeroofing.com |
| Address | 4120 Brighton Blvd, Denver, CO 80216 |
| License | CO-RC-48219 |
| Service area | Denver, Lakewood, Aurora, Wheat Ridge, Arvada, Littleton, Englewood, Golden |
| In-area ZIP | 80207 |
| Out-of-area ZIP | 90210 |
| Inspection | $149 |
| Deposit | $500 |
| Tune-up | $399 |
| Estimator | 2,200 sq ft, Metal → about $19,800–$28,600 |
| Lead name | Dana Whitfield |
| Lead phone | (303) 555-0176 |
| Lead email | dana.whitfield@example.com |
| Lead address | 2841 Ash Street, Denver, CO 80207 |
| Lead service | Replacement |
| Lead notes | Hail hit the south slope on 12 May. Missing shingles above the primary bedroom; insurance photos are ready. |
| Invoice customer | Dana Whitfield |
| Invoice email | dana.whitfield@example.com |
| Job total | $14,250 |
| Invoice balance | $13,750 |
| Invoice mode | Email the invoice link (manual) |
| Local admin key | `dev-admin` (local only; never in the public repo) |

---

## 5. What to say when something is a limitation

Say it plainly. Reviewers trust a known limitation more than a fake success.

- **`whop.app` vs `whop.site`:** “Whop resolves the `.whop.app` alias and
  redirects it to `.whop.site`. The app type is `website`. A custom domain is
  the only clean branded URL; the platform suffix is not configurable.”
- **Full card number:** “Whop Elements isolates the card fields. The host page
  only receives network and last four. Mirroring the full number would require a
  custom card form, which is exactly what the brief rules out.”
- **Leads:** “Whop has no public Leads API in the Current API. The lead is a
  Whop member plus a `lead` event. The code marks this `// VERIFY:` in
  `src/lib/whop.server.ts`.”
- **Invoice:** “The invoice code is complete, but the account must finish
  business verification before Whop will issue, send or charge. The draft
  creation works; the issue step is gated by Whop.”

---

## 6. Page-by-page checklist

- [ ] `/` — hero, estimator, services, before/after, tracker, ZIP, financing, reviews, form, footer, mobile bar
- [ ] `/?demo=1#estimate` — prefilled lead form
- [ ] `/?events=1` — event panel
- [ ] `/checkout/inspection` — one-time checkout
- [ ] `/checkout/deposit` — saved-card checkout
- [ ] `/checkout/deposit?events=1` — `deposit_started` fires on the live site
- [ ] `/checkout/tune-up` — one-time checkout
- [ ] `/checkout/return?plan=deposit&payment=pay_demo_recording&status=succeeded` — success preview
- [ ] `/admin/invoice?demo=1` — owner invoice tool
- [ ] `/checkout/not-a-plan` — graceful not-found
- [ ] Mobile width (390 px) — menu, sticky bar, stacked checkout
- [ ] Theme toggle + reload — saved theme
- [ ] Keyboard: tab to toggle, form fields, buttons; visible focus

---

## 7. Useful commands

```bash
# Local demo (simulated server writes; no real charges)
WHOP_DEMO_MODE=1 ADMIN_KEY=dev-admin npm run dev

# Typecheck and build
npx tsc --noEmit
npm run build

# Live deploy
npx whop apps deploy

# Plans
npx whop variants list --product_ids prod_QNRGg5f3qGSQv --format json

# Invoices (production key required)
npx whop invoices list --format json
```

---

## 8. After recording

When the shoot is done, ask for the dummy data to be removed. The cleanup is:

1. Replace the demo company, phone, address, license, cities, ZIPs, reviews and
   image labels in `config/site.ts` with the real business values.
2. Remove the two recording aids:
   - the `?demo=1` prefill in `src/components/sections/EstimateForm.tsx`
   - the `?demo=1` prefill in `src/routes/admin.invoice.tsx`
3. Redeploy.
4. Delete the test lead/member and any draft invoice created during the shoot.
5. Rotate `ADMIN_KEY` if it was shown or shared.
