import { Contactless, Check, Close } from "../ui/Icons";
import { site } from "../../../config/site";

export type CardVisualState = {
  brand?: string | null;
  last4?: string | null;
  methodLabel?: string | null;
  complete?: boolean;
  error?: boolean;
};

/**
 * DECORATIVE ONLY.
 *
 * This is not a card form and never touches card data. Whop's PaymentElement
 * owns the PCI-isolated inputs in its own iframe. The only values shown here
 * come from PaymentElement.onChange (brand, last4, displayName, complete) and
 * from onError. No number, expiry or CVC is ever read or stored by this page.
 *
 * // VERIFY: the web PaymentElement does not expose per-field focus events, so
 * flipping on CVC focus is not wired. The accessible "View back" control lets
 * the presenter show the back face without pretending we received a focus
 * event from Whop. If Whop adds a focus event, replace this control.
 */
export function DecorativeCard({
  state,
  side,
  onFlip,
}: {
  state: CardVisualState;
  side: "front" | "back";
  onFlip: () => void;
}) {
  const brand = state.brand?.toUpperCase() || state.methodLabel || "WHOP PAY";
  const last4 = state.last4 || "••••";

  return (
    <div className="decorative-wrap">
      <div
        className={`decorative-card ${side === "back" ? "is-back" : ""} ${
          state.complete ? "is-complete" : ""
        } ${state.error ? "is-error" : ""}`}
        role="img"
        aria-label={`Decorative payment card preview${state.complete ? ", payment details complete" : ""}`}
      >
        <div className="decorative-inner">
          <div className="decorative-face decorative-front">
            <div className="card-arcs" aria-hidden="true">
              <span className="arc arc-orange" />
              <span className="arc arc-blue" />
            </div>
            <div className="card-top">
              <span className="card-issuer">
                <svg width="16" height="16" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <path d="M4 23 20 8l16 15M9 23v11h22V23" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {site.company.logo.trailing.toUpperCase()}
              </span>
              <span className="card-chip" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <Contactless size={22} className="card-contactless" />
            </div>

            <p className="card-number" aria-label={`Card ending ${last4}`}>
              <span>••••</span>
              <span>••••</span>
              <span>••••</span>
              <span>{last4}</span>
            </p>

            <div className="card-bottom">
              <div>
                <p className="card-label">PROJECT</p>
                <p className="card-value">{site.company.name}</p>
              </div>
              <div>
                <p className="card-label">EXPIRES</p>
                <p className="card-value">•• / ••</p>
              </div>
              <p className="card-brand">{brand}</p>
            </div>

            {state.complete && (
              <span className="card-complete" aria-hidden="true">
                <Check size={16} />
              </span>
            )}
          </div>

          <div className="decorative-face decorative-back">
            <div className="card-magstripe" aria-hidden="true" />
            <div className="card-signature" aria-hidden="true">
              <span>AUTHORIZED SIGNATURE</span>
              <span className="card-cvc">CVC</span>
            </div>
            <p className="card-back-note">
              Decorative card · not a payment form.
              <br />
              Card details stay inside Whop’s secure fields.
            </p>
            <div className="card-back-arcs" aria-hidden="true">
              <span className="arc arc-orange" />
              <span className="arc arc-blue" />
            </div>
          </div>
        </div>
      </div>

      <div className="decorative-meta">
        <p className="mono-label">
          Decorative preview · network and last four sync from Whop after the
          full card number is entered. The full number, expiry and CVC stay in
          the secure fields.
        </p>
        <button
          type="button"
          className="card-flip"
          onClick={onFlip}
          aria-pressed={side === "back"}
          aria-label={side === "back" ? "Show card front" : "Show card back"}
        >
          {side === "back" ? "View front" : "View back"}
        </button>
      </div>

      <p
        className={`card-sync-status ${state.last4 ? "is-synced" : ""}`}
        aria-live="polite"
      >
        {state.complete
          ? `Card ready · ${brand} ending ${last4}`
          : state.last4
            ? `${brand} ending ${last4} · finish expiry and CVC to pay`
            : "Last four appears after the 16-digit card number is complete"}
      </p>

      {state.error && (
        <p className="card-error-note" role="alert">
          <Close size={14} /> Check the payment details in the secure fields.
        </p>
      )}
    </div>
  );
}
