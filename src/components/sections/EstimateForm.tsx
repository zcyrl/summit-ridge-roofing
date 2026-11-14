import { useEffect, useState, type FormEvent } from "react";
import { site } from "../../../config/site";
import {
  readStoredEstimatePrefill,
  subscribeEstimatePrefill,
  type EstimatePrefill,
} from "../../lib/prefill";
import { track } from "../../lib/tracking";
import { ArrowRight, CheckCircle, Clock, ShieldCheck } from "../ui/Icons";

type FormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  zip: string;
  service: string;
  notes: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const emptyForm: FormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  zip: "",
  service: site.services[1]?.name ?? site.services[0].name,
  notes: "",
};

const demoForm: FormState = {
  name: "Dana Whitfield",
  phone: "(303) 555-0176",
  email: "dana.whitfield@example.com",
  address: "2841 Ash Street",
  zip: "80207",
  service: "Replacement",
  notes:
    "Hail hit the south slope on 12 May. Missing shingles above the primary bedroom; insurance photos are ready.",
};

type Status = "idle" | "loading" | "success" | "error";

export function EstimateForm() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  function applyPrefill(detail: EstimatePrefill) {
    setForm((current) => ({
      ...current,
      service:
        detail.service && site.services.some((item) => item.name === detail.service)
          ? detail.service
          : current.service,
      notes: detail.notes ?? current.notes,
    }));
    setStatus((current) => (current === "success" ? "idle" : current));
  }

  useEffect(() => {
    const stored = readStoredEstimatePrefill();
    if (stored) applyPrefill(stored);
    return subscribeEstimatePrefill(applyPrefill);
    // applyPrefill is stable enough for this one-time subscription; the store
    // delivers later estimator selections to it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recording aid: /?demo=1 fills the form with a believable job, so the
  // screen recording does not have to type every field. Normal visitors never
  // see this branch.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("demo") !== "1") return;
    setForm((current) => ({ ...current, ...demoForm }));
  }, []);

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (status === "error") {
      setStatus("idle");
      setMessage("");
    }
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name.";
    if ((form.phone.match(/\d/g) ?? []).length < 7) {
      next.phone = "Enter a phone number we can reach you on.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (form.address.trim().length < 5) next.address = "Enter the property address.";
    if (!/^\d{5}$/.test(form.zip.trim())) next.zip = "Enter a 5-digit ZIP code.";
    if (!form.service) next.service = "Choose a service.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    if (!validate()) {
      setStatus("error");
      setMessage("Check the highlighted fields and try again.");
      return;
    }

    setStatus("loading");
    setMessage("");
    setWarning(null);

    try {
      const requestId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`;
      const response = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, requestId }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        fields?: FieldErrors;
        leadId?: string;
        eventId?: string | null;
        demo?: boolean;
        warning?: string;
      };

      if (!response.ok || !data.ok) {
        setStatus("error");
        setMessage(data.error ?? "The request could not be sent. Try again or call us.");
        setErrors(data.fields ?? {});
        return;
      }

      setStatus("success");
      setReference(data.leadId ?? null);
      setWarning(data.warning ?? null);
      track(site.tracking.events.estimate, {
        service: form.service,
        zip: form.zip,
        event_id: data.eventId ?? data.leadId,
      });
    } catch {
      setStatus("error");
      setMessage(
        `We could not send the request. Check your connection or call ${site.company.phone}.`,
      );
    }
  }

  function reset() {
    setForm(emptyForm);
    setErrors({});
    setStatus("idle");
    setMessage("");
    setReference(null);
    setWarning(null);
    window.setTimeout(() => {
      document.getElementById("estimate-name")?.focus();
    }, 50);
  }

  return (
    <section className="section estimate" id="estimate" aria-labelledby="estimate-title">
      <div className="container estimate-grid">
        <div className="estimate-copy">
          <p className="mono-label">{site.copy.formEyebrow}</p>
          <h2 id="estimate-title">
            {site.copy.formTitleLead} <em>{site.copy.formTitleAccent}</em>
          </h2>
          <p className="estimate-body">{site.copy.formBody}</p>

          <ol className="next-steps">
            <li>
              <span className="next-step-icon" aria-hidden="true">
                <Clock size={18} />
              </span>
              <div>
                <strong>We reply {site.serviceArea.responseTime}.</strong>
                <p>A real person reads every request. No call centre, no bot.</p>
              </div>
            </li>
            <li>
              <span className="next-step-icon" aria-hidden="true">
                <CheckCircle size={18} />
              </span>
              <div>
                <strong>You get a written scope.</strong>
                <p>Materials, line items and the earliest start date.</p>
              </div>
            </li>
            <li>
              <span className="next-step-icon" aria-hidden="true">
                <ShieldCheck size={18} />
              </span>
              <div>
                <strong>You decide, in writing.</strong>
                <p>Deposit and final balance are both approved before charging.</p>
              </div>
            </li>
          </ol>

          <div className="estimate-area">
            <p className="mono-label">Service area</p>
            <p>{site.serviceArea.cities.join(" · ")}</p>
          </div>
        </div>

        <div className="estimate-card">
          {status === "success" ? (
            <div className="form-success" role="status">
              <span className="success-icon" aria-hidden="true">
                <CheckCircle size={34} />
              </span>
              <h3>Request received.</h3>
              <p>
                We will reply {site.serviceArea.responseTime}. If it is urgent,
                call{" "}
                <a href={site.company.phoneHref}>{site.company.phone}</a>.
              </p>
              {reference && (
                <p className="form-reference mono-label">
                  Reference · {reference}
                </p>
              )}
              {warning && <p className="form-warning">{warning}</p>}
              <button type="button" className="btn btn-ghost" onClick={reset}>
                Send another request
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="form-head">
                <h3>Request an estimate</h3>
                <p className="mono-label">Creates a lead in Whop</p>
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="estimate-name">Name</label>
                  <input
                    id="estimate-name"
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "error-name" : undefined}
                    required
                  />
                  {errors.name && (
                    <p className="field-error" id="error-name">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="estimate-phone">Phone</label>
                  <input
                    id="estimate-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "error-phone" : undefined}
                    required
                  />
                  {errors.phone && (
                    <p className="field-error" id="error-phone">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="field field-wide">
                  <label htmlFor="estimate-email">Email</label>
                  <input
                    id="estimate-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "error-email" : undefined}
                    required
                  />
                  {errors.email && (
                    <p className="field-error" id="error-email">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="field field-wide">
                  <label htmlFor="estimate-address">Property address</label>
                  <input
                    id="estimate-address"
                    name="address"
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(event) => update("address", event.target.value)}
                    aria-invalid={Boolean(errors.address)}
                    aria-describedby={errors.address ? "error-address" : undefined}
                    required
                  />
                  {errors.address && (
                    <p className="field-error" id="error-address">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="estimate-zip">ZIP</label>
                  <input
                    id="estimate-zip"
                    name="zip"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={5}
                    value={form.zip}
                    onChange={(event) =>
                      update("zip", event.target.value.replace(/[^\d]/g, ""))
                    }
                    aria-invalid={Boolean(errors.zip)}
                    aria-describedby={errors.zip ? "error-zip" : undefined}
                    required
                  />
                  {errors.zip && (
                    <p className="field-error" id="error-zip">
                      {errors.zip}
                    </p>
                  )}
                </div>

                <div className="field">
                  <label htmlFor="estimate-service">Service</label>
                  <select
                    id="estimate-service"
                    name="service"
                    value={form.service}
                    onChange={(event) => update("service", event.target.value)}
                    aria-invalid={Boolean(errors.service)}
                    aria-describedby={errors.service ? "error-service" : undefined}
                  >
                    {site.services.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                  {errors.service && (
                    <p className="field-error" id="error-service">
                      {errors.service}
                    </p>
                  )}
                </div>

                <div className="field field-wide">
                  <label htmlFor="estimate-notes">
                    Notes <span className="optional">optional</span>
                  </label>
                  <textarea
                    id="estimate-notes"
                    name="notes"
                    rows={3}
                    value={form.notes}
                    onChange={(event) => update("notes", event.target.value)}
                    placeholder="Leak near the chimney, missing shingles, storm date…"
                    aria-invalid={Boolean(errors.notes)}
                    aria-describedby={errors.notes ? "error-notes" : undefined}
                  />
                  {errors.notes && (
                    <p className="field-error" id="error-notes">
                      {errors.notes}
                    </p>
                  )}
                </div>
              </div>

              {status === "error" && message && (
                <p className="form-error" role="alert">
                  {message}
                </p>
              )}

              <div className="form-submit">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={status === "loading"}
                  aria-busy={status === "loading"}
                >
                  {status === "loading" ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send request
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <p className="form-privacy">
                  No card details on this form. Payment happens on Whop.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
