import { useEffect, useMemo, useRef, useState } from "react";
import {
  BrandingElement,
  Checkout,
  EmailElement,
  ExpressCheckoutElement,
  PaymentElement,
  Payments,
  usePayments,
  useWhop,
  WhopElements,
  type Appearance,
  type PaymentElementChangeEvent,
} from "@whop/elements-react";
import { loadWhop, type Whop } from "@whop/elements";
import { site, type Plan } from "../../../config/site";
import { useTheme } from "../../lib/theme";
import { track } from "../../lib/tracking";
import { CheckoutPanel, CheckoutShell } from "./CheckoutShell";
import { DecorativeCard, type CardVisualState } from "./DecorativeCard";
import { ArrowRight, CheckCircle, ShieldCheck } from "../ui/Icons";

type PaymentPayload = {
  id: string;
  status: string;
  clientSecret: string | null;
  amount: number;
  currency: string;
};

function goToReturn(planKey: string, paymentId: string, status: "succeeded" | "processing") {
  const params = new URLSearchParams({
    plan: planKey,
    payment: paymentId,
    status,
  });
  window.location.assign(`/checkout/return?${params.toString()}`);
}

async function finishPayment(
  payment: PaymentPayload,
  whop: Whop | null,
  planKey: string,
  returnUrl: string,
) {
  const status = payment.status?.toLowerCase();

  if (status === "paid" || status === "succeeded") {
    goToReturn(planKey, payment.id, "succeeded");
    return;
  }
  if (status === "processing" || status === "pending") {
    goToReturn(planKey, payment.id, "processing");
    return;
  }
  if (status === "failed" || status === "canceled" || status === "declined") {
    throw new Error("The payment was not completed. No money was taken — try another method.");
  }

  if (!payment.clientSecret) {
    throw new Error(
      "Whop did not return a next step for this payment. Check the payment in your Whop dashboard.",
    );
  }
  if (!whop) {
    throw new Error("The secure payment SDK is still loading. Please try again in a moment.");
  }

  const result = await whop.payments.handleNextAction({
    clientSecret: payment.clientSecret,
    returnUrl,
  });
  if (result.redirected) return;

  if (result.status === "succeeded") {
    goToReturn(planKey, payment.id, "succeeded");
    return;
  }
  if (result.status === "processing") {
    goToReturn(planKey, payment.id, "processing");
    return;
  }

  throw new Error(
    result.lastPaymentError?.message ??
      "The payment step was not completed. Nothing was charged.",
  );
}

/* -------------------------------------------------------------------------- */
/* Payment form (Payments group)                                              */
/* -------------------------------------------------------------------------- */

function PaymentForm({
  plan,
  accountId,
  returnUrl,
  onCardState,
}: {
  plan: Plan;
  accountId: string;
  returnUrl: string;
  onCardState: (state: CardVisualState) => void;
}) {
  const isDeposit = plan.kind === "deposit";

  return (
    <Payments
      accountId={accountId}
      plan={plan.id}
      returnUrl={returnUrl}
      // The buyer is told in the element that the method is saved for later.
      // Whop requires this consent on the handle; the payment API then saves
      // the method on success. Nothing extra is charged today.
      setupFutureUsage={isDeposit ? "off_session" : undefined}
    >
      <PaymentFormInner
        plan={plan}
        returnUrl={returnUrl}
        onCardState={onCardState}
      />
    </Payments>
  );
}

function PaymentFormInner({
  plan,
  returnUrl,
  onCardState,
}: {
  plan: Plan;
  returnUrl: string;
  onCardState: (state: CardVisualState) => void;
}) {
  const payments = usePayments();
  const whop = useWhop();
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDeposit = plan.kind === "deposit";

  function handleChange(event: PaymentElementChangeEvent) {
    setReady(event.complete);
    setError(null);
    onCardState({
      complete: event.complete,
      brand: event.paymentMethod?.card?.network ?? null,
      last4: event.paymentMethod?.card?.last4 ?? null,
      methodLabel: event.paymentMethod?.displayName ?? null,
      error: false,
    });
  }

  async function pay() {
    if (!payments || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const { confirmationToken } = await payments.createConfirmationToken({});
      const requestId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`;

      const response = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planKey: plan.key,
          confirmationToken,
          returnUrl,
          requestId,
        }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        payment?: PaymentPayload;
      };

      if (!response.ok || !data.ok || !data.payment) {
        throw new Error(data.error ?? "Whop could not start the payment.");
      }

      await finishPayment(data.payment, whop, plan.key, returnUrl);
    } catch (err) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code?: string }).code)
          : "";
      const message =
        code === "payment_request_cancelled"
          ? "Payment cancelled. Nothing was charged."
          : err instanceof Error
            ? err.message
            : "The payment could not be completed. Please try again.";
      setError(message);
      onCardState({ error: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="checkout-form">
      {isDeposit && (
        <div className="checkout-save-note">
          <CheckCircle size={18} />
          <p>
            <strong>Card saved for your final balance.</strong> You approve the
            balance before it is charged. Nothing else is charged today.
          </p>
        </div>
      )}

      <EmailElement className="whop-slot" />
      <PaymentElement
        className="whop-slot"
        onChange={handleChange}
        onError={(event) => {
          setError(event.message);
          onCardState({ error: true });
        }}
        {...(isDeposit
          ? {}
          : { wallets: { applePay: "never" as const, googlePay: "never" as const } })}
      />
      <BrandingElement className="whop-slot" />

      {error && (
        <p className="checkout-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        className="btn btn-primary btn-lg checkout-pay"
        onClick={pay}
        disabled={!ready || submitting}
        aria-busy={submitting}
      >
        {submitting ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Confirming…
          </>
        ) : (
          <>
            {isDeposit
              ? `Pay ${plan.priceLabel} · save card`
              : `Pay ${plan.priceLabel}`}
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <p className="checkout-terms">
        {isDeposit
          ? "Your card is stored by Whop, never by this site. The final invoice is created only after your job is complete."
          : "One-time payment. A receipt and project details are emailed by Whop."}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Express wallets (Checkout group)                                           */
/* -------------------------------------------------------------------------- */

function ExpressWallets({
  plan,
  returnUrl,
  orderId,
}: {
  plan: Plan;
  returnUrl: string;
  orderId: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const metadata = useMemo(
    () => ({ order_id: orderId, plan_key: plan.key, source: "roofing_website" }),
    [orderId, plan.key],
  );

  return (
    <div className="express-block">
      <div className="express-head">
        <p className="mono-label">Express checkout</p>
        <p className="express-caption mono-label">Apple Pay · Google Pay</p>
      </div>
      <Checkout
        key={`${plan.id}-${orderId}`}
        plan={plan.id}
        returnUrl={returnUrl}
        metadata={metadata}
        onComplete={(completion) => {
          if (completion.result === "payment") {
            // CheckoutElement normally navigates to returnUrl itself. This is
            // a belt-and-braces handoff that still reads status on the return
            // page; fulfillment belongs to the webhook in production.
            goToReturn(plan.key, completion.paymentId, "succeeded");
          }
        }}
      >
        <ExpressCheckoutElement
          layout="horizontal"
          wallets={{ applePay: "auto", googlePay: "auto" }}
          onError={(event) => setError(event.message)}
        />
      </Checkout>
      <p className="express-note">
        Wallet buttons appear when your device supports them. Otherwise pay by
        card below.
      </p>
      {error && (
        <p className="checkout-error" role="alert">
          {error}
        </p>
      )}
      <div className="checkout-divider" aria-hidden="true">
        <span />
        <em>or pay by card</em>
        <span />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export function CheckoutClient({
  plan,
  accountId,
  demoMode,
  environment,
}: {
  plan: Plan;
  accountId: string;
  demoMode: boolean;
  environment: "production" | "sandbox";
}) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [elements, setElements] = useState<ReturnType<typeof loadWhop> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cardState, setCardState] = useState<CardVisualState>({});
  const [cardSide, setCardSide] = useState<"front" | "back">("front");
  const [orderId, setOrderId] = useState("");
  const trackedDeposit = useRef(false);

  const configured =
    !demoMode &&
    Boolean(accountId) &&
    !accountId.includes("REPLACE") &&
    !plan.id.includes("REPLACE");

  const returnUrl = mounted
    ? `${window.location.origin}/checkout/return?plan=${plan.key}`
    : "";

  const appearance = useMemo<Appearance>(
    () => ({
      theme: {
        appearance: theme,
        accentColor: "orange",
        grayColor: "sand",
      },
      variables: {
        "--radius": "10px",
      },
    }),
    [theme],
  );

  useEffect(() => {
    setMounted(true);
    // Never inject the hosted Elements bundle on an unconfigured checkout:
    // there is nothing to mount, and it would load payment scripts for no
    // reason. It starts as soon as real account + plan IDs are present.
    if (configured) setElements(loadWhop());
    setOrderId(
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}`,
    );
  }, [configured]);

  useEffect(() => {
    setCardState({});
    setCardSide("front");
    trackedDeposit.current = false;
  }, [plan.key]);

  useEffect(() => {
    if (cardState.complete) setCardSide("front");
  }, [cardState.complete]);

  useEffect(() => {
    if (!configured || plan.kind !== "deposit" || trackedDeposit.current) return;
    trackedDeposit.current = true;
    track(site.tracking.events.deposit, {
      plan: plan.key,
      value: plan.price,
      currency: "USD",
    });
  }, [configured, plan.kind, plan.key, plan.price]);

  const note =
    plan.kind === "deposit"
      ? undefined
      : plan.key === "inspection"
        ? "Credited toward a repair booked within 30 days"
        : "Flat rate · no add-ons without your approval";

  return (
    <CheckoutShell
      plan={plan}
      card={
        <DecorativeCard
          state={cardState}
          side={cardSide}
          onFlip={() => setCardSide((current) => (current === "front" ? "back" : "front"))}
        />
      }
    >
      <CheckoutPanel plan={plan} note={note}>
        {!configured ? (
          <SetupNotice
            accountId={accountId}
            demoMode={demoMode}
            planId={plan.id}
          />
        ) : !mounted || !elements ? (
          <CheckoutSkeleton />
        ) : (
          <WhopElements
            elements={elements}
            appearance={appearance}
            environment={environment}
            onLoadError={(error) => setLoadError(error.message)}
          >
            {plan.kind === "one-time" && (
              <ExpressWallets
                plan={plan}
                returnUrl={returnUrl}
                orderId={orderId}
              />
            )}
            <PaymentForm
              plan={plan}
              accountId={accountId}
              returnUrl={returnUrl}
              onCardState={setCardState}
            />
            {loadError && (
              <p className="checkout-error" role="alert">
                The secure payment form could not load: {loadError}
              </p>
            )}
          </WhopElements>
        )}
      </CheckoutPanel>
    </CheckoutShell>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="checkout-skeleton" aria-busy="true" aria-label="Loading secure checkout">
      <div className="skeleton-line wide" />
      <div className="skeleton-line" />
      <div className="skeleton-box" />
      <div className="skeleton-line wide" />
      <div className="skeleton-line short" />
      <p className="mono-label">Loading secure checkout…</p>
    </div>
  );
}

function SetupNotice({
  accountId,
  demoMode,
  planId,
}: {
  accountId: string;
  demoMode: boolean;
  planId: string;
}) {
  return (
    <div className="setup-notice">
      <span className="setup-icon" aria-hidden="true">
        <ShieldCheck size={26} />
      </span>
      {demoMode ? (
        <>
          <p className="mono-label">Local demo mode</p>
          <h3>Record the real card form on the live site.</h3>
          <p>
            Whop Elements is tied to the deployed app, so it does not mount on
            localhost. The live checkout has the real secure card fields,
            saved-card consent and Whop branding.
          </p>
          <p className="setup-warning">
            This local build simulates leads and invoices only. No payment is
            possible here, and no card is ever charged.
          </p>
          <p className="setup-foot">
            Use the live URL for the checkout shots. Use this local URL for the
            lead form, owner invoice tool and event log.
          </p>
        </>
      ) : (
        <>
          <p className="mono-label">Checkout not configured yet</p>
          <h3>Add your Whop plans to go live.</h3>
          <p>
            The site is running, but this checkout needs real Whop IDs before it
            can collect a payment. This is the expected state on a fresh
            template.
          </p>
          <ol>
            <li>
              Run <code>npm run plans:create</code> and paste the three plan IDs
              into <code>config/site.ts</code>.
            </li>
            <li>
              Put your <code>biz_…</code> account ID in{" "}
              <code>WHOP_ACCOUNT_ID</code> (or deploy on whop.app, where it is
              injected).
            </li>
            <li>
              Reload this page. The current account placeholder is{" "}
              <code>{accountId || "empty"}</code>, plan <code>{planId}</code>.
            </li>
          </ol>
          <p className="setup-foot">
            Whop Elements mounts only with a real account and plan. The rest of
            the site — estimator, lead form, theme, tracking — works without
            them.
          </p>
        </>
      )}
    </div>
  );
}
