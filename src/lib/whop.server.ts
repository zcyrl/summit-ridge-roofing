/**
 * Server-only Whop API wrapper.
 *
 * Every network call to Whop lives in this file. The browser never imports it
 * (routes use dynamic import inside server handlers), and the API key never
 * reaches the client.
 *
 * Hosted on whop.app, server fetches through WHOP_API_ORIGIN are signed by the
 * platform's outbound proxy. Locally, export WHOP_API_KEY and it is used here.
 *
 * // VERIFY: Whop's public Current API (docs.whop.com, Nov 2026) exposes no
 * /leads endpoint. `createLead` therefore uses the documented equivalent:
 * POST /members creates the CRM record, then POST /events records a `lead`
 * event with the form details. Replace only this one function if Whop ships a
 * dedicated Leads API. No endpoint was invented.
 */

import { site, type PlanKey } from "../../config/site";

const API_ORIGIN = (process.env.WHOP_API_ORIGIN || "https://api.whop.com").replace(
  /\/+$/,
  "",
);
const API_VERSION = process.env.WHOP_API_VERSION || "2026-11-13-1";
const API_KEY = process.env.WHOP_API_KEY?.trim();
const DEMO = process.env.WHOP_DEMO_MODE === "1";

export class WhopApiError extends Error {
  status: number;
  type: string;

  constructor(message: string, status = 500, type = "whop_error") {
    super(message);
    this.name = "WhopApiError";
    this.status = status;
    this.type = type;
  }
}

export function isDemoMode(): boolean {
  return DEMO;
}

export function getAccountId(): string {
  return process.env.WHOP_ACCOUNT_ID?.trim() || site.whop.accountId;
}

export function getPublicWhopConfig() {
  return {
    accountId: getAccountId(),
    demoMode: isDemoMode(),
    environment: (process.env.WHOP_API_ORIGIN?.includes("sandbox")
      ? "sandbox"
      : "production") as "production" | "sandbox",
  };
}

function assertPlanId(id: string): string {
  if (!id || id.includes("REPLACE")) {
    throw new WhopApiError(
      "This plan ID is still a placeholder. Run `npm run plans:create` and paste the returned plan IDs into config/site.ts.",
      500,
      "plan_not_configured",
    );
  }
  return id;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  idempotencyKey?: string;
};

async function whopFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Api-Version-Date": API_VERSION,
  };

  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (API_KEY) headers.Authorization = `Bearer ${API_KEY}`;
  if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;

  let response: Response;
  try {
    response = await fetch(`${API_ORIGIN}/api/v1${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });
  } catch (error) {
    throw new WhopApiError(
      `Could not reach Whop (${error instanceof Error ? error.message : "network error"}).`,
      503,
      "network_error",
    );
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const errorBody =
      data && typeof data === "object" && "error" in data
        ? (data as { error?: { message?: string; type?: string } }).error
        : undefined;
    const message =
      errorBody?.message ||
      (typeof data === "string" && data) ||
      `Whop returned HTTP ${response.status}.`;
    throw new WhopApiError(message, response.status, errorBody?.type || "whop_error");
  }

  return data as T;
}

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type WhopMoney = {
  amount: string;
  currency: string;
  decimals: number;
  display_decimals: number;
};

type WhopPayment = {
  id: string;
  status: string;
  variant_id: string | null;
  member_id: string | null;
  payment_method_id: string | null;
  payment_method_type: string | null;
  customer_email: string | null;
  total: WhopMoney | null;
  metadata: Record<string, unknown> | null;
  client_secret: string | null;
  payment_instrument: {
    display_name?: string;
    payment_method_type?: string;
    card?: { brand?: string; last4?: string; exp_month?: number; exp_year?: number } | null;
  } | null;
};

type WhopInvoice = {
  id: string;
  number: string;
  status: string;
  member_id: string | null;
  total: WhopMoney;
  amount_due: WhopMoney | null;
  checkout_link: string | null;
  due_at: string | null;
  paid_at: string | null;
  payment_method_id: string | null;
  scheduled_charge_at: string | null;
  recipient_emails: string[];
};

export type PaymentSummary = {
  id: string;
  status: string;
  clientSecret: string | null;
  memberId: string | null;
  paymentMethodId: string | null;
  paymentMethodType: string | null;
  customerEmail: string | null;
  amount: number;
  currency: string;
  variantId: string | null;
  planKey: PlanKey | null;
  cardBrand: string | null;
  cardLast4: string | null;
  instrumentLabel: string | null;
  metadata: Record<string, unknown> | null;
};

export type InvoiceSummary = {
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

export type LeadInput = {
  requestId?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  zip: string;
  service: string;
  notes?: string;
};

export type LeadResult = {
  memberId: string;
  leadEventId: string | null;
  demo: boolean;
  warning?: string;
};

export type InvoiceInput = {
  requestId?: string;
  jobTotal: number;
  mode: "auto" | "manual";
  customerName: string;
  email: string;
  memberId?: string;
  paymentMethodId?: string;
  memo?: string;
  dueInDays?: number;
};

/* -------------------------------------------------------------------------- */
/* Mapping                                                                    */
/* -------------------------------------------------------------------------- */

function toMajor(money: WhopMoney | null | undefined): number {
  if (!money) return 0;
  const value = Number(money.amount);
  return Number.isFinite(value) ? value : 0;
}

function planForVariant(variantId: string | null): PlanKey | null {
  if (!variantId) return null;
  for (const [key, plan] of Object.entries(site.plans)) {
    if (plan.id === variantId) return key as PlanKey;
  }
  return null;
}

function mapPayment(payment: WhopPayment): PaymentSummary {
  const card = payment.payment_instrument?.card;
  return {
    id: payment.id,
    status: payment.status,
    clientSecret: payment.client_secret,
    memberId: payment.member_id,
    paymentMethodId: payment.payment_method_id,
    paymentMethodType: payment.payment_method_type,
    customerEmail: payment.customer_email,
    amount: toMajor(payment.total),
    currency: payment.total?.currency?.toUpperCase() || "USD",
    variantId: payment.variant_id,
    planKey: planForVariant(payment.variant_id),
    cardBrand: card?.brand ?? null,
    cardLast4: card?.last4 ?? null,
    instrumentLabel: payment.payment_instrument?.display_name ?? null,
    metadata: payment.metadata,
  };
}

function mapInvoice(invoice: WhopInvoice): InvoiceSummary {
  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    memberId: invoice.member_id,
    total: toMajor(invoice.total),
    amountDue: invoice.amount_due ? toMajor(invoice.amount_due) : null,
    currency: invoice.total?.currency?.toUpperCase() || "USD",
    checkoutLink: invoice.checkout_link,
    dueAt: invoice.due_at,
    paidAt: invoice.paid_at,
    paymentMethodId: invoice.payment_method_id,
    scheduledChargeAt: invoice.scheduled_charge_at,
    recipientEmails: invoice.recipient_emails ?? [],
  };
}

function idempotencyKey(prefix: string, requestId?: string): string | undefined {
  const clean = requestId?.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  return clean ? `${prefix}_${clean}` : undefined;
}

/* -------------------------------------------------------------------------- */
/* Leads                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Creates the lead: a Whop Member for the customer, plus a server-side `lead`
 * pixel event carrying the request details.
 *
 * // VERIFY: Whop has no public /leads resource. This is the documented
 * equivalent (Members + Events). See the file header.
 */
export async function createLead(input: LeadInput): Promise<LeadResult> {
  if (DEMO) {
    return {
      memberId: "mber_demo_lead",
      leadEventId: `evt_demo_${Date.now().toString(36)}`,
      demo: true,
      warning:
        "DEMO MODE: no Whop API call was made. Set WHOP_DEMO_MODE=0 and provide a key to create a real member and lead event.",
    };
  }

  const accountId = getAccountId();
  if (!accountId || accountId.includes("REPLACE")) {
    throw new WhopApiError(
      "WHOP_ACCOUNT_ID is not configured. Add it to .env (or deploy on whop.app, where it is injected).",
      500,
      "account_not_configured",
    );
  }

  const [firstName, ...rest] = input.name.trim().split(/\s+/);
  const lastName = rest.join(" ");

  const member = await whopFetch<{ id: string }>("/members", {
    method: "POST",
    idempotencyKey: idempotencyKey("member", input.requestId),
    body: {
      account_id: accountId,
      email: input.email,
      name: input.name,
    },
  });

  let leadEventId: string | null = null;
  let warning: string | undefined;

  try {
    const event = await whopFetch<{ id?: string }>("/events", {
      method: "POST",
      idempotencyKey: idempotencyKey("lead", input.requestId),
      body: {
        account_id: accountId,
        event_name: "lead",
        event_id: `lead_${input.requestId ?? Date.now().toString(36)}`,
        user: {
          email: input.email,
          phone: input.phone,
          first_name: firstName,
          last_name: lastName || undefined,
          postal_code: input.zip,
          country: "US",
        },
      },
    });
    leadEventId = event.id ?? null;
  } catch (error) {
    // The Member is the durable CRM record. A pixel permission failure should
    // not lose the lead, so surface a warning instead of failing the form.
    warning =
      error instanceof WhopApiError
        ? `Member created, but the lead event was not recorded: ${error.message}`
        : "Member created, but the lead event was not recorded.";
    console.warn("[whop] lead event failed", error);
  }

  return { memberId: member.id, leadEventId, demo: false, warning };
}

/* -------------------------------------------------------------------------- */
/* Payments                                                                   */
/* -------------------------------------------------------------------------- */

export async function createCheckoutPayment(args: {
  planKey: PlanKey;
  confirmationToken: string;
  returnUrl: string;
  email?: string;
  requestId?: string;
}): Promise<PaymentSummary> {
  if (DEMO) {
    return {
      id: `pay_demo_${Date.now().toString(36)}`,
      status: "succeeded",
      clientSecret: null,
      memberId: "mber_demo_lead",
      paymentMethodId: "payt_demo_card",
      paymentMethodType: "card",
      customerEmail: args.email ?? "demo@example.com",
      amount: site.plans[args.planKey].price,
      currency: "USD",
      variantId: site.plans[args.planKey].id,
      planKey: args.planKey,
      cardBrand: "visa",
      cardLast4: "4242",
      instrumentLabel: "Visa •••• 4242",
      metadata: { demo: true, plan_key: args.planKey },
    };
  }

  if (!args.confirmationToken?.startsWith("ctok_")) {
    throw new WhopApiError(
      "The payment method token is missing or invalid. Reload the checkout and try again.",
      400,
      "invalid_confirmation_token",
    );
  }

  const accountId = getAccountId();
  const plan = site.plans[args.planKey];
  const payment = await whopFetch<WhopPayment>("/payments", {
    method: "POST",
    idempotencyKey: idempotencyKey("pay", args.requestId),
    body: {
      account_id: accountId,
      variant_id: assertPlanId(plan.id),
      confirmation_token: args.confirmationToken,
      return_url: args.returnUrl,
      ...(args.email ? { email: args.email } : {}),
      metadata: {
        source: "roofing_website",
        plan_key: args.planKey,
        deposit_amount: String(site.plans.deposit.price),
      },
    },
  });

  return mapPayment(payment);
}

export async function retrievePayment(paymentId: string): Promise<PaymentSummary> {
  if (!/^pay_[a-zA-Z0-9_]+$/.test(paymentId)) {
    throw new WhopApiError("That does not look like a Whop payment ID.", 400, "invalid_id");
  }
  if (DEMO) {
    return {
      id: paymentId,
      status: "succeeded",
      clientSecret: null,
      memberId: "mber_demo_lead",
      paymentMethodId: "payt_demo_card",
      paymentMethodType: "card",
      customerEmail: "demo@example.com",
      amount: site.plans.deposit.price,
      currency: "USD",
      variantId: site.plans.deposit.id,
      planKey: "deposit",
      cardBrand: "visa",
      cardLast4: "4242",
      instrumentLabel: "Visa •••• 4242",
      metadata: { demo: true },
    };
  }
  const payment = await whopFetch<WhopPayment>(`/payments/${paymentId}`);
  return mapPayment(payment);
}

/**
 * The deposit checkout needs the saved payment method for the final invoice.
 * The payment record carries both the member and the saved card ID.
 */
export async function getDepositSummary(paymentId: string): Promise<PaymentSummary> {
  const payment = await retrievePayment(paymentId);
  return payment;
}

/* -------------------------------------------------------------------------- */
/* Invoices                                                                   */
/* -------------------------------------------------------------------------- */

export async function retrieveInvoice(invoiceId: string): Promise<InvoiceSummary> {
  if (!/^(pay|inv)_[a-zA-Z0-9_]+$/.test(invoiceId)) {
    throw new WhopApiError("That does not look like a Whop invoice ID.", 400, "invalid_id");
  }
  if (DEMO) {
    return {
      id: invoiceId,
      number: "INV-DEMO-0001",
      status: "open",
      memberId: "mber_demo_lead",
      total: 7800,
      amountDue: 7800,
      currency: "USD",
      checkoutLink: "https://whop.com/checkout/demo",
      dueAt: new Date(Date.now() + 7 * 864e5).toISOString(),
      paidAt: null,
      paymentMethodId: "payt_demo_card",
      scheduledChargeAt: null,
      recipientEmails: ["demo@example.com"],
    };
  }
  const invoice = await whopFetch<WhopInvoice>(`/invoices/${invoiceId}`);
  return mapInvoice(invoice);
}

/**
 * Creates the final balance invoice (job total − deposit), then either:
 *  - auto: issue + charge the saved payment method now, or
 *  - manual: issue + email the invoice with its checkout link.
 */
export async function createFinalInvoice(
  input: InvoiceInput,
): Promise<{ invoice: InvoiceSummary; mode: "auto" | "manual"; warning?: string }> {
  const deposit = site.plans.deposit.price;
  const balance = Math.round((input.jobTotal - deposit) * 100) / 100;

  if (!Number.isFinite(input.jobTotal) || input.jobTotal <= deposit) {
    throw new WhopApiError(
      `The job total must be greater than the $${deposit} deposit.`,
      400,
      "invalid_total",
    );
  }
  if (input.mode === "auto" && (!input.memberId || !input.paymentMethodId)) {
    throw new WhopApiError(
      "Auto-charge needs both the member ID and the saved payment method ID from the deposit checkout.",
      400,
      "missing_saved_method",
    );
  }

  if (DEMO) {
    return {
      mode: input.mode,
      warning:
        "DEMO MODE: no invoice was created. Set WHOP_DEMO_MODE=0 and provide a key to use the Whop Invoices API.",
      invoice: {
        id: "pay_demo_invoice",
        number: "INV-DEMO-0001",
        status: input.mode === "auto" ? "pending" : "open",
        memberId: input.memberId ?? "mber_demo_lead",
        total: balance,
        amountDue: input.mode === "auto" ? 0 : balance,
        currency: "USD",
        checkoutLink:
          input.mode === "manual" ? "https://whop.com/checkout/demo" : null,
        dueAt: new Date(Date.now() + 7 * 864e5).toISOString(),
        paidAt: null,
        paymentMethodId: input.paymentMethodId ?? null,
        scheduledChargeAt: null,
        recipientEmails: [input.email],
      },
    };
  }

  const accountId = getAccountId();
  const dueAt = new Date(Date.now() + (input.dueInDays ?? 7) * 864e5).toISOString();

  const draft = await whopFetch<WhopInvoice>("/invoices", {
    method: "POST",
    idempotencyKey: idempotencyKey("invoice", input.requestId),
    body: {
      account_id: accountId,
      // The API accepts member_id OR email_address, never both.
      ...(input.memberId
        ? {
            member_id: input.memberId,
            recipient_emails: [input.email],
          }
        : {
            email_address: input.email,
            customer_name: input.customerName,
            recipient_emails: [input.email],
          }),
      due_at: dueAt,
      memo:
        input.memo?.trim() ||
        `Final balance for your roofing project. The $${deposit} deposit has already been paid.`,
      metadata: {
        kind: "final_balance",
        deposit_amount: String(deposit),
        job_total: String(input.jobTotal),
      },
      ...(input.mode === "auto" && input.paymentMethodId
        ? { payment_method_id: input.paymentMethodId }
        : {}),
      items: [
        {
          quantity: 1,
          variant: {
            title: `Final balance — ${input.customerName}`,
            currency: "usd",
            billing_type: "one_time",
            initial_price: balance,
            visibility: "hidden",
            allow_multiple_quantity: false,
          },
        },
      ],
    },
  });

  let warning: string | undefined;

  try {
    // Issue resolves final tax and opens the invoice. With a saved method it
    // schedules the charge; `charge` below pulls it forward to now.
    await whopFetch(`/invoices/${draft.id}/issue`, {
      method: "POST",
      body: {},
      idempotencyKey: idempotencyKey("invoice_issue", input.requestId),
    });

    if (input.mode === "auto") {
      await whopFetch(`/invoices/${draft.id}/charge`, {
        method: "POST",
        body: {},
        idempotencyKey: idempotencyKey("invoice_charge", input.requestId),
      });
    } else {
      await whopFetch(`/invoices/${draft.id}/send`, {
        method: "POST",
        body: {},
        idempotencyKey: idempotencyKey("invoice_send", input.requestId),
      });
    }
  } catch (error) {
    warning =
      error instanceof WhopApiError
        ? error.message
        : "The invoice was created, but the final collection step did not finish.";
    console.warn("[whop] invoice collection step failed", error);
  }

  const invoice = await whopFetch<WhopInvoice>(`/invoices/${draft.id}`);
  return { invoice: mapInvoice(invoice), mode: input.mode, warning };
}
