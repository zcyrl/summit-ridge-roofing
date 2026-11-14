import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { site, type Plan } from "../../../config/site";
import { Logo } from "../ui/Logo";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Tracker } from "../sections/Tracker";
import { ArrowRight, ShieldCheck } from "../ui/Icons";

export function CheckoutShell({
  plan,
  card,
  children,
}: {
  plan: Plan;
  card: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <div className="container checkout-header-inner">
          <Logo />
          <div className="checkout-header-actions">
            <Link to="/" className="back-link">
              Back to site
              <ArrowRight size={16} />
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container checkout-grid">
        <section className="checkout-left" aria-labelledby="checkout-title">
          <p className="mono-label">
            Secure checkout <span className="dot">·</span> {site.whop.environmentLabel}
          </p>
          <h1 id="checkout-title">
            Secure your <em>project.</em>
          </h1>
          <p className="checkout-lede">
            {plan.kind === "deposit"
              ? "Reserve your install date and keep your card on file for the final balance. You approve the balance before it is charged."
              : "One payment, one clear scope. Your receipt and project details are emailed as soon as Whop confirms the charge."}
          </p>

          {card}

          <div className="checkout-tracker">
            <Tracker />
          </div>

          <p className="checkout-secure">
            <ShieldCheck size={17} />
            Card details are collected by Whop’s PCI-isolated fields. This page
            never sees or stores them.
          </p>
        </section>

        <div className="checkout-right">{children}</div>
      </main>

      <footer className="checkout-footer">
        <div className="container checkout-footer-inner">
          <p>
            {site.company.legalName} · {site.company.license}
          </p>
          <p>
            Questions? <a href={site.company.phoneHref}>{site.company.phone}</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export function CheckoutPanel({
  plan,
  children,
  note,
}: {
  plan: Plan;
  children: ReactNode;
  note?: string;
}) {
  return (
    <section className="checkout-panel" aria-label={`${plan.name} checkout`}>
      <div className="checkout-panel-head">
        <p className="mono-label">{plan.badge}</p>
        <div className="checkout-plan-row">
          <h2>{plan.shortName}</h2>
          <p className="checkout-plan-price">
            {plan.priceLabel} <span>{plan.priceSuffix}</span>
          </p>
        </div>
        <p className="checkout-plan-description">{plan.description}</p>
        {note && <p className="checkout-plan-note">{note}</p>}
      </div>
      {children}
    </section>
  );
}
