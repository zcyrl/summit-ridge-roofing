import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getPlan, planSlug, resolvePlanKey, site } from "../../config/site";
import { Logo } from "../components/ui/Logo";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Close,
} from "../components/ui/Icons";

type Search = {
  plan?: string;
  payment?: string;
  status?: string;
};

type ConfirmedPayment = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  memberId: string | null;
  paymentMethodId: string | null;
  customerEmail: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  instrumentLabel: string | null;
};

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    plan: typeof search.plan === "string" ? search.plan : undefined,
    payment: typeof search.payment === "string" ? search.payment : undefined,
    status: typeof search.status === "string" ? search.status : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Payment status — ${site.company.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutReturn,
});

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="copy-field">
      <span className="mono-label">{label}</span>
      <code>{value}</code>
      <button type="button" onClick={copy} aria-label={`Copy ${label}`}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function CheckoutReturn() {
  const search = Route.useSearch();
  const status = search.status ?? "";
  const resolvedPlan = search.plan ? resolvePlanKey(search.plan) : null;
  const plan = resolvedPlan ? getPlan(resolvedPlan) : site.plans.deposit;
  const [payment, setPayment] = useState<ConfirmedPayment | null>(null);
  const [loading, setLoading] = useState(Boolean(search.payment));
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!search.payment) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);

    fetch(`/api/checkout/confirm?payment=${encodeURIComponent(search.payment)}`)
      .then(async (response) => {
        const data = (await response.json()) as {
          ok: boolean;
          error?: string;
          payment?: ConfirmedPayment;
        };
        if (!active) return;
        if (!response.ok || !data.ok || !data.payment) {
          setLoadError(data.error ?? "The payment details could not be loaded.");
        } else {
          setPayment(data.payment);
        }
      })
      .catch(() => {
        if (active) setLoadError("The payment details could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search.payment]);

  const succeeded = status === "succeeded";
  const failed = status === "failed" || status === "canceled";
  const pending = status === "processing" || (!failed && !succeeded && loading);

  return (
    <div className="result-page">
      <header className="checkout-header">
        <div className="container checkout-header-inner">
          <Logo />
          <ThemeToggle />
        </div>
      </header>

      <main className="container result-main" id="main">
        <div className="result-card" aria-live="polite">
          {succeeded && (
            <>
              <span className="result-icon is-success" aria-hidden="true">
                <CheckCircle size={36} />
              </span>
              <p className="mono-label">Payment confirmed by Whop</p>
              <h1>
                {plan.kind === "deposit" ? (
                  <>
                    Deposit received. <em>Your date is reserved.</em>
                  </>
                ) : (
                  <>
                    You’re booked. <em>We’ll be in touch.</em>
                  </>
                )}
              </h1>
              <p className="result-body">
                {plan.kind === "deposit"
                  ? "Your card is saved securely for the final balance. We will confirm your crew window and send the scope by email. Nothing else is charged until you approve the final invoice."
                  : "Whop has emailed your receipt. We will confirm the appointment window by email and call if we need anything else."}
              </p>

              <div className="result-summary">
                <div>
                  <span className="mono-label">Plan</span>
                  <strong>{plan.name}</strong>
                </div>
                <div>
                  <span className="mono-label">Paid</span>
                  <strong>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: payment?.currency || "USD",
                      maximumFractionDigits: 0,
                    }).format(payment?.amount ?? plan.price)}
                  </strong>
                </div>
                <div>
                  <span className="mono-label">Email</span>
                  <strong>{payment?.customerEmail ?? "sent by Whop"}</strong>
                </div>
              </div>

              {payment && (
                <div className="result-ids">
                  <p className="mono-label">
                    Keep these for the final invoice · the office uses them
                  </p>
                  <CopyField label="Payment ID" value={payment.id} />
                  {payment.memberId && (
                    <CopyField label="Member ID" value={payment.memberId} />
                  )}
                  {payment.paymentMethodId && (
                    <CopyField
                      label="Saved payment method"
                      value={payment.paymentMethodId}
                    />
                  )}
                  {(payment.instrumentLabel || payment.cardLast4) && (
                    <p className="result-card-line">
                      Card on file:{" "}
                      <strong>
                        {payment.instrumentLabel ??
                          `${payment.cardBrand ?? "Card"} •••• ${payment.cardLast4}`}
                      </strong>
                    </p>
                  )}
                </div>
              )}

              {loadError && <p className="result-note">{loadError}</p>}

              <div className="result-actions">
                <Link className="btn btn-primary" to="/">
                  Back to {site.company.name}
                  <ArrowRight size={17} />
                </Link>
                {plan.kind === "deposit" && search.payment && (
                  <Link
                    className="btn btn-ghost"
                    to="/admin/invoice"
                    search={{ payment: search.payment }}
                  >
                    Open invoice tool
                  </Link>
                )}
              </div>
            </>
          )}

          {failed && (
            <>
              <span className="result-icon is-failed" aria-hidden="true">
                <Close size={36} />
              </span>
              <p className="mono-label">Payment not completed</p>
              <h1>
                Nothing was <em>charged.</em>
              </h1>
              <p className="result-body">
                The payment was cancelled or declined before it completed. You
                can try again with another method, or call {site.company.phone}{" "}
                and we will take the details over the phone.
              </p>
              <div className="result-actions">
                <Link
                  className="btn btn-primary"
                  to="/checkout/$planKey"
                  params={{ planKey: planSlug(plan.key) }}
                >
                  Try again
                  <ArrowRight size={17} />
                </Link>
                <Link className="btn btn-ghost" to="/">
                  Back to site
                </Link>
              </div>
            </>
          )}

          {pending && (
            <>
              <span className="result-icon is-pending" aria-hidden="true">
                <Clock size={36} />
              </span>
              <p className="mono-label">Payment processing</p>
              <h1>
                We’re confirming <em>the payment.</em>
              </h1>
              <p className="result-body">
                Whop is still settling the charge. You will get a receipt by
                email as soon as it clears. If it does not arrive within a few
                minutes, call {site.company.phone}.
              </p>
              {search.payment && (
                <div className="result-ids">
                  <CopyField label="Payment ID" value={search.payment} />
                </div>
              )}
              <div className="result-actions">
                <Link className="btn btn-primary" to="/">
                  Back to site
                </Link>
              </div>
            </>
          )}

          {!succeeded && !failed && !pending && (
            <>
              <span className="result-icon is-pending" aria-hidden="true">
                <Clock size={36} />
              </span>
              <p className="mono-label">No payment reference</p>
              <h1>
                This page shows <em>a payment result.</em>
              </h1>
              <p className="result-body">
                Open a checkout to start a payment, or go back to the site to
                request an estimate.
              </p>
              <div className="result-actions">
                <Link className="btn btn-primary" to="/">
                  Back to site
                  <ArrowRight size={17} />
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="result-foot">
          Payment status is read from Whop. This page is a display, not proof of
          fulfillment; the office confirms every job by email.
        </p>
      </main>
    </div>
  );
}
