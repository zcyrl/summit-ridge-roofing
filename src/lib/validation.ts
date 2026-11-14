import { site } from "../../config/site";

export type EstimateInput = {
  name: string;
  phone: string;
  email: string;
  address: string;
  zip: string;
  service: string;
  notes: string;
  requestId?: string;
};

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: Record<string, string> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ZIP = /^\d{5}(-\d{4})?$/;
const PHONE_DIGITS = /\d/g;

export function validateEstimate(body: unknown): ValidationResult<EstimateInput> {
  const errors: Record<string, string> = {};
  const raw = (body ?? {}) as Record<string, unknown>;
  const text = (key: string) => (typeof raw[key] === "string" ? raw[key].trim() : "");

  const name = text("name");
  const phone = text("phone");
  const email = text("email");
  const address = text("address");
  const zip = text("zip");
  const service = text("service");
  const notes = text("notes");
  const requestId = text("requestId");

  if (name.length < 2) errors.name = "Enter your full name.";
  if (name.length > 120) errors.name = "Keep your name under 120 characters.";

  const digitCount = (phone.match(PHONE_DIGITS) ?? []).length;
  if (digitCount < 7 || digitCount > 15) errors.phone = "Enter a phone number we can reach you on.";

  if (!EMAIL.test(email)) errors.email = "Enter a valid email address.";

  if (address.length < 5) errors.address = "Enter the property address.";
  if (address.length > 240) errors.address = "Keep the address under 240 characters.";

  if (!ZIP.test(zip)) errors.zip = "Enter a 5-digit ZIP code.";

  const allowed = new Set<string>(site.services.map((serviceItem) => serviceItem.name));
  if (!allowed.has(service)) errors.service = "Choose a service.";

  if (notes.length > 1200) errors.notes = "Keep notes under 1,200 characters.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { name, phone, email, address, zip, service, notes, requestId: requestId || undefined },
  };
}

export type InvoiceInputRaw = {
  jobTotal: number;
  mode: "auto" | "manual";
  customerName: string;
  email: string;
  memberId?: string;
  paymentMethodId?: string;
  memo?: string;
  requestId?: string;
  dueInDays?: number;
};

export function validateInvoice(body: unknown): ValidationResult<InvoiceInputRaw> {
  const errors: Record<string, string> = {};
  const raw = (body ?? {}) as Record<string, unknown>;
  const text = (key: string) => (typeof raw[key] === "string" ? raw[key].trim() : "");

  const jobTotal = Number(raw.jobTotal);
  const mode = raw.mode === "auto" ? "auto" : raw.mode === "manual" ? "manual" : null;
  const customerName = text("customerName");
  const email = text("email");
  const memberId = text("memberId");
  const paymentMethodId = text("paymentMethodId");
  const memo = text("memo");
  const requestId = text("requestId");
  const dueInDays = Number(raw.dueInDays ?? 7);

  if (!Number.isFinite(jobTotal) || jobTotal <= site.plans.deposit.price) {
    errors.jobTotal = `Enter a job total greater than the $${site.plans.deposit.price} deposit.`;
  }
  if (jobTotal > 500_000) errors.jobTotal = "That job total looks too large. Check the amount.";
  if (!mode) errors.mode = "Choose auto-charge or send an invoice.";
  if (customerName.length < 2) errors.customerName = "Enter the customer name.";
  if (!EMAIL.test(email)) errors.email = "Enter a valid customer email.";
  if (mode === "auto" && !memberId) errors.memberId = "Auto-charge needs the member ID.";
  if (mode === "auto" && !paymentMethodId) {
    errors.paymentMethodId = "Auto-charge needs the saved payment method ID.";
  }
  if (memo.length > 1000) errors.memo = "Keep the memo under 1,000 characters.";
  if (!Number.isFinite(dueInDays) || dueInDays < 1 || dueInDays > 60) {
    errors.dueInDays = "Choose a due date between 1 and 60 days.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      jobTotal,
      mode: mode as "auto" | "manual",
      customerName,
      email,
      memberId: memberId || undefined,
      paymentMethodId: paymentMethodId || undefined,
      memo: memo || undefined,
      requestId: requestId || undefined,
      dueInDays,
    },
  };
}

export function validateCheckoutToken(body: unknown): ValidationResult<{
  confirmationToken: string;
  planKey: string;
  returnUrl: string;
  requestId?: string;
}> {
  const raw = (body ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const confirmationToken =
    typeof raw.confirmationToken === "string" ? raw.confirmationToken.trim() : "";
  const planKey = typeof raw.planKey === "string" ? raw.planKey.trim() : "";
  const returnUrl = typeof raw.returnUrl === "string" ? raw.returnUrl.trim() : "";
  const requestId = typeof raw.requestId === "string" ? raw.requestId.trim() : "";

  if (!confirmationToken.startsWith("ctok_")) {
    errors.confirmationToken = "Missing payment method token.";
  }
  if (planKey !== "inspection" && planKey !== "tuneUp" && planKey !== "deposit") {
    errors.planKey = "Unknown plan.";
  }
  try {
    const parsed = new URL(returnUrl);
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
      errors.returnUrl = "Return URL must be https.";
    }
  } catch {
    errors.returnUrl = "Return URL is invalid.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      confirmationToken,
      planKey,
      returnUrl,
      requestId: requestId || undefined,
    },
  };
}
