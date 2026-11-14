import { Link } from "@tanstack/react-router";
import { site } from "../../../config/site";
import { Logo } from "../ui/Logo";
import { Phone } from "../ui/Icons";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" id="contact">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p className="footer-blurb">{site.copy.footerBlurb}</p>
          <p className="footer-legal">
            {site.copy.legal} · {site.company.licenseState}
          </p>
        </div>

        <div className="footer-col">
          <p className="mono-label">Contact</p>
          <a className="footer-phone" href={site.company.phoneHref}>
            <Phone size={18} />
            {site.company.phone}
          </a>
          <a href={`mailto:${site.company.email}`}>{site.company.email}</a>
          <p>
            {site.company.address.line1}
            <br />
            {site.company.address.city}, {site.company.address.state}{" "}
            {site.company.address.zip}
          </p>
        </div>

        <div className="footer-col">
          <p className="mono-label">Hours</p>
          {site.company.hours.map((row) => (
            <p key={row.days} className="footer-hours">
              <span>{row.days}</span>
              <span>{row.time}</span>
            </p>
          ))}
        </div>

        <div className="footer-col">
          <p className="mono-label">Explore</p>
          <a href="#services">Services</a>
          <a href="#area">Service area</a>
          <a href="#financing">Financing</a>
          <a href="#estimate">Request an estimate</a>
          <Link to="/checkout/$planKey" params={{ planKey: "inspection" }}>
            Book an inspection
          </Link>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>
          © {year} {site.company.legalName}. All rights reserved.
        </p>
        <p>
          Payments by {site.whop.environmentLabel} · Whop is the merchant of
          record.
        </p>
      </div>
    </footer>
  );
}
