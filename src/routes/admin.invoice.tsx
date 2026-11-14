import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { formatUsd, site } from "../../config/site";
import { Logo } from "../components/ui/Logo";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { ArrowRight, CheckCircle, ShieldCheck } from "../components/ui/Icons";

type Search = { payment?: string };

type InvoiceData = {
  id: string;
  number: string;
  status: string;
  memberId: string | null;
  total: number;
  amountDue: number | null;
  currency: string;
  checkoutLink: string | null;
  dueAt: string | null;
  paidAt: string | null;
  paymentMethodId: string | null;
  scheduledChargeAt: string | null;
  recipientEmails: string[];
};

type InvoiceResponse = {
  ok: boolean;
  error?: string;
  fields?: Record<string, string>;
  invoice?: InvoiceData;
  mode?: "auto" | "manual";
  warning?: string;
};

type Mode = "auto" | "manual";

export const Route = createFileRoute("/admin/invoice")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    payment: typeof search.payment === "string" ? search.payment : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Invoice tool — ${site.company.name}` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminInvoice,
});

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="admin-copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

function AdminInvoice() {
  const search = Route.useSearch();
  const [demo, setDemo] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [paymentId, setPaymentId] = useState(search.payment ?? "");
  const [jobTotal, setJobTotal] = useState("");
  const [mode, setMode] = useState<Mode>("manual");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [memberId, setMemberId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [memo, setMemo] = useState("");
  const [dueInDays, setDueInDays] = useState("7");
  const [loading, setLoading] = useState(false);
  const [loadingDeposit, setLoadingDeposit] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<InvoiceResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const totalNumber = Number(jobTotal);
  const balance = useMemo(() => {
    if (!Number.isFinite(totalNumber) || totalNumber <= 0) return 0;
    return Math.max(0, Math.round((totalNumber - site.plans.deposit.price) * 100) / 100);
  }, [totalNumber]);

  async function loadDeposit(id = paymentId) {
    if (!id.trim()) {
      setLookupMessage("Paste a deposit payment ID first.");
      return;
    }
    setLoadingDeposit(true);
    setLookupMessage(null);
    setError(null);
    try {
      const response = await fetch(
        `/api/checkout/confirm?payment=${encodeURIComponent(id.trim())}`,
      );
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        payment?: {
          id: string;
          memberId: string | null;
          paymentMethodId: string | null;
          customerEmail: string | null;
          instrumentLabel: string | null;
          cardBrand: string | null;
          cardLast4: string | null;
          status: string;
        };
      };
      if (!response.ok || !data.ok || !data.payment) {
        setLookupMessage(data.error ?? "That payment could not be loaded.");
        return;
      }
      setMemberId(data.payment.memberId ?? "");
      setPaymentMethodId(data.payment.paymentMethodId ?? "");
      if (data.payment.customerEmail && !email) setEmail(data.payment.customerEmail);
      setLookupMessage(
        `Loaded ${data.payment.instrumentLabel ?? "saved method"} · status ${data.payment.status}. ${
          data.payment.paymentMethodId
            ? "Payment method ID filled."
            : "No saved card on this payment."
        }`,
      );
    } catch {
      setLookupMessage("The deposit lookup failed. Check the payment ID and try again.");
    } finally {
      setLoadingDeposit(false);
    }
  }

  useEffect(() => {
    if (search.payment) {
      setPaymentId(search.payment);
      void loadDeposit(search.payment);
    }
    // The lookup runs once for a shared payment link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.payment]);

  // Recording aid. Read the query directly so the URL stays `?demo=1` and does
  // not pass through the router's search serialiser.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("demo") !== "1") return;
    setDemo(true);
    setJobTotal((current) => current || "14250");
    setCustomerName((current) => current || "Dana Whitfield");
    setEmail((current) => current || "dana.whitfield@example.com");
    setMemberId((current) => current || "mber_demo_lead");
    setPaymentMethodId((current) => current || "payt_demo_card");
    setMemo((current) => current || "Final balance — architectural shingle replacement");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setResult(null);

    if (!adminKey.trim()) {
      setError("Enter the ADMIN_KEY you stored in Whop secrets.");
      return;
    }

    setLoading(true);
    try {
      const requestId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`;
      const response = await fetch("/api/admin/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey.trim(),
        },
        body: JSON.stringify({
          requestId,
          jobTotal: totalNumber,
          mode,
          customerName,
          email,
          memberId: memberId || undefined,
          paymentMethodId: paymentMethodId || undefined,
          memo: memo || undefined,
          dueInDays: Number(dueInDays),
        }),
      });
      const data = (await response.json()) as InvoiceResponse;
      if (!response.ok || !data.ok) {
        setError(data.error ?? "The invoice could not be created.");
        setFieldErrors(data.fields ?? {});
        return;
      }
      setResult(data);
    } catch {
      setError("The invoice request failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    if (!result?.invoice || !adminKey) return;
    setRefreshing(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/admin/invoice?id=${encodeURIComponent(result.invoice.id)}`,
        { headers: { "x-admin-key": adminKey.trim() } },
      );
      const data = (await response.json()) as InvoiceResponse;
      if (!response.ok || !data.ok || !data.invoice) {
        setError(data.error ?? "The invoice status could not be refreshed.");
        return;
      }
      setResult((current) => (current ? { ...current, invoice: data.invoice } : current));
    } catch {
      setError("The invoice status could not be refreshed.");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="admin-page">
      <header className="checkout-header">
        <div className="container checkout-header-inner">
          <Logo />
          <div className="checkout-header-actions">
            <Link to="/" className="back-link">
              Back to site <ArrowRight size={16} />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container admin-main" id="main">
        <div className="admin-head">
          <p className="mono-label">Owner-only tool · {site.whop.environmentLabel}</p>
          <h1>
            Final <em>invoice.</em>
          </h1>
          <p className="admin-lede">
            Balance = job total minus the {site.plans.deposit.priceLabel} deposit.
            Charge the saved card from the deposit checkout, or email the
            invoice link for manual payment.
          </p>
          {demo && (
            <p className="admin-demo-note">
              Demo values loaded. {import.meta.env.DEV ? "The local key is " : ""}
              {import.meta.env.DEV ? <code>dev-admin</code> : null}
              {import.meta.env.DEV ? "." : "Use your production ADMIN_KEY."}
            </p>
          )}
        </div>

        <div className="admin-grid">
          <form className="admin-form" onSubmit={submit} noValidate>
            <div className="admin-section">
              <div className="admin-section-head">
                <h2>1 · Access</h2>
                <span className="mono-label">ADMIN_KEY</span>
              </div>
              <div className="field">
                <label htmlFor="admin-key">Admin key</label>
                <input
                  id="admin-key"
                  type="password"
                  autoComplete="off"
                  value={adminKey}
                  onChange={(event) => setAdminKey(event.target.value)}
                  required
                />
                <p className="field-hint">
                  Set it with{" "}
                  <code>whop apps secrets set --secret ADMIN_KEY=…</code> and type
                  it here. It is sent only in the request header.
                </p>
              </div>
            </div>

            <div className="admin-section">
              <div className="admin-section-head">
                <h2>2 · Deposit</h2>
                <span className="mono-label">Optional lookup</span>
              </div>
              <div className="field">
                <label htmlFor="deposit-payment">Deposit payment ID</label>
                <div className="inline-field">
                  <input
                    id="deposit-payment"
                    value={paymentId}
                    onChange={(event) => setPaymentId(event.target.value)}
                    placeholder="pay_…"
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => void loadDeposit()}
                    disabled={loadingDeposit}
                  >
                    {loadingDeposit ? "Loading…" : "Load details"}
                  </button>
                </div>
                <p className="field-hint">
                  Copy the payment ID from the deposit confirmation page. This
                  fills the member and saved card, nothing else.
                </p>
                {lookupMessage && <p className="field-hint is-info">{lookupMessage}</p>}
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="member-id">Member ID</label>
                  <input
                    id="member-id"
                    value={memberId}
                    onChange={(event) => setMemberId(event.target.value)}
                    placeholder="mber_…"
                    aria-invalid={Boolean(fieldErrors.memberId)}
                    aria-describedby={fieldErrors.memberId ? "err-member" : undefined}
                  />
                  {fieldErrors.memberId && (
                    <p className="field-error" id="err-member">
                      {fieldErrors.memberId}
                    </p>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="payment-method">Saved payment method ID</label>
                  <input
                    id="payment-method"
                    value={paymentMethodId}
                    onChange={(event) => setPaymentMethodId(event.target.value)}
                    placeholder="payt_…"
                    aria-invalid={Boolean(fieldErrors.paymentMethodId)}
                    aria-describedby={
                      fieldErrors.paymentMethodId ? "err-payment-method" : undefined
                    }
                  />
                  {fieldErrors.paymentMethodId && (
                    <p className="field-error" id="err-payment-method">
                      {fieldErrors.paymentMethodId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-section">
              <div className="admin-section-head">
                <h2>3 · Balance</h2>
                <span className="mono-label">Job total − deposit</span>
              </div>
              <div className="field">
                <label htmlFor="job-total">Job total (USD)</label>
                <input
                  id="job-total"
                  type="number"
                  inputMode="decimal"
                  min={site.plans.deposit.price + 1}
                  step="0.01"
                  value={jobTotal}
                  onChange={(event) => setJobTotal(event.target.value)}
                  placeholder="12000"
                  aria-invalid={Boolean(fieldErrors.jobTotal)}
                  aria-describedby={fieldErrors.jobTotal ? "err-total" : "balance-preview"}
                  required
                />
                {fieldErrors.jobTotal && (
                  <p className="field-error" id="err-total">
                    {fieldErrors.jobTotal}
                  </p>
                )}
                <p className="field-hint" id="balance-preview">
                  Balance to invoice: <strong>{formatUsd(balance)}</strong> after
                  the {site.plans.deposit.priceLabel} deposit.
                </p>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="customer-name">Customer name</label>
                  <input
                    id="customer-name"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    autoComplete="name"
                    aria-invalid={Boolean(fieldErrors.customerName)}
                    required
                  />
                  {fieldErrors.customerName && (
                    <p className="field-error">{fieldErrors.customerName}</p>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="customer-email">Customer email</label>
                  <input
                    id="customer-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    aria-invalid={Boolean(fieldErrors.email)}
                    required
                  />
                  {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
                </div>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="due-days">Due in (days)</label>
                  <input
                    id="due-days"
                    type="number"
                    min={1}
                    max={60}
                    value={dueInDays}
                    onChange={(event) => setDueInDays(event.target.value)}
                    aria-invalid={Boolean(fieldErrors.dueInDays)}
                  />
                  {fieldErrors.dueInDays && (
                    <p className="field-error">{fieldErrors.dueInDays}</p>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="memo">
                    Memo <span className="optional">optional</span>
                  </label>
                  <input
                    id="memo"
                    value={memo}
                    onChange={(event) => setMemo(event.target.value)}
                    placeholder="Final balance for your roof replacement"
                  />
                </div>
              </div>

              <fieldset className="mode-fieldset">
                <legend>Collection</legend>
                <label className={`mode-card ${mode === "auto" ? "is-active" : ""}`}>
                  <input
                    type="radio"
                    name="mode"
                    value="auto"
                    checked={mode === "auto"}
                    onChange={() => setMode("auto")}
                  />
                  <span>
                    <strong>Charge saved card now</strong>
                    <small>
                      Issues the invoice and charges the deposit card
                      off-session. Uses member + payment method IDs.
                    </small>
                  </span>
                </label>
                <label className={`mode-card ${mode === "manual" ? "is-active" : ""}`}>
                  <input
                    type="radio"
                    name="mode"
                    value="manual"
                    checked={mode === "manual"}
                    onChange={() => setMode("manual")}
                  />
                  <span>
                    <strong>Email the invoice link</strong>
                    <small>
                      Issues the invoice and emails a secure Whop checkout link.
                      The customer pays manually.
                    </small>
                  </span>
                </label>
              </fieldset>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <div className="admin-submit">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Creating invoice…
                  </>
                ) : (
                  <>
                    {mode === "auto" ? "Create and charge" : "Create and email"}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              <p>
                <ShieldCheck size={15} /> This route runs on the server. The Whop
                key and admin key never enter the browser bundle.
              </p>
            </div>
          </form>

          <aside className="admin-result" aria-live="polite">
            {result?.invoice ? (
              <>
                <div className="admin-result-head">
                  <span className="result-icon is-success" aria-hidden="true">
                    <CheckCircle size={28} />
                  </span>
                  <div>
                    <p className="mono-label">Invoice created</p>
                    <h2>{result.invoice.number}</h2>
                  </div>
                </div>

                <span className={`status-pill status-${result.invoice.status}`}>
                  {result.invoice.status}
                </span>

                <dl className="admin-facts">
                  <div>
                    <dt>Balance</dt>
                    <dd>{formatUsd(result.invoice.total)}</dd>
                  </div>
                  <div>
                    <dt>Amount due</dt>
                    <dd>
                      {result.invoice.amountDue === null
                        ? "—"
                        : formatUsd(result.invoice.amountDue)}
                    </dd>
                  </div>
                  <div>
                    <dt>Mode</dt>
                    <dd>{result.mode === "auto" ? "Auto-charge" : "Manual email"}</dd>
                  </div>
                  <div>
                    <dt>Due</dt>
                    <dd>
                      {result.invoice.dueAt
                        ? new Date(result.invoice.dueAt).toLocaleDateString()
                        : "—"}
                    </dd>
                  </div>
                  {result.invoice.scheduledChargeAt && (
                    <div>
                      <dt>Scheduled charge</dt>
                      <dd>
                        {new Date(result.invoice.scheduledChargeAt).toLocaleString()}
                      </dd>
                    </div>
                  )}
                  {result.invoice.paidAt && (
                    <div>
                      <dt>Paid</dt>
                      <dd>{new Date(result.invoice.paidAt).toLocaleString()}</dd>
                    </div>
                  )}
                </dl>

                {result.invoice.checkoutLink && (
                  <div className="admin-link">
                    <p className="mono-label">Customer payment link</p>
                    <a
                      href={result.invoice.checkoutLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Whop checkout
                      <ArrowRight size={15} />
                    </a>
                    <CopyButton value={result.invoice.checkoutLink} />
                  </div>
                )}

                {result.warning && (
                  <p className="form-warning" role="alert">
                    {result.warning}
                  </p>
                )}

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => void refresh()}
                  disabled={refreshing}
                >
                  {refreshing ? "Refreshing…" : "Refresh status"}
                </button>

                <p className="admin-note">
                  The invoice ID is <code>{result.invoice.id}</code>. Auto-charge
                  is asynchronous: the status may stay <code>open</code> or{" "}
                  <code>pending</code> until Whop settles it. The customer is
                  emailed either way.
                </p>
              </>
            ) : (
              <div className="admin-empty">
                <span className="mono-label">Invoice status</span>
                <h2>
                  Nothing <em>yet.</em>
                </h2>
                <p>
                  Create an invoice to see its number, status, amount due and
                  customer payment link here.
                </p>
                <div className="admin-flow">
                  <span>Deposit $500</span>
                  <span>Job complete</span>
                  <span>Final balance</span>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
