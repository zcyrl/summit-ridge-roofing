import { Link } from "@tanstack/react-router";
import { site } from "../../../config/site";
import { Phone } from "../ui/Icons";

export function MobileBar() {
  return (
    <nav className="mobile-bar" aria-label="Quick actions">
      <a className="mobile-bar-item" href={site.company.phoneHref}>
        <Phone size={18} />
        <span>Call</span>
      </a>
      <a className="mobile-bar-item mobile-bar-primary" href="#estimate">
        <span>Get estimate</span>
      </a>
      <Link
        className="mobile-bar-item"
        to="/checkout/$planKey"
        params={{ planKey: "inspection" }}
      >
        <span>Book {site.plans.inspection.priceLabel}</span>
      </Link>
    </nav>
  );
}
