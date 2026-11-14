import { useEffect, useState } from "react";
import { site } from "../../../config/site";
import { Logo } from "../ui/Logo";
import { ThemeToggle } from "../ui/ThemeToggle";
import { ArrowRight, Close, Menu } from "../ui/Icons";

const links = [
  { label: "Services", href: "#services" },
  { label: "Area", href: "#area" },
  { label: "Financing", href: "#financing" },
  { label: "Reviews", href: "#reviews" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />

        <nav className="desktop-nav" aria-label="Main">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          <a className="btn btn-primary header-cta" href="#estimate">
            Request an estimate
          </a>
          <button
            type="button"
            className="menu-button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <Close size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mobile-menu" id="mobile-menu">
          <nav className="container mobile-nav" aria-label="Mobile">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
                <ArrowRight size={18} />
              </a>
            ))}
            <a
              className="btn btn-primary btn-block"
              href="#estimate"
              onClick={() => setOpen(false)}
            >
              Request an estimate
            </a>
            <a className="mobile-call" href={site.company.phoneHref}>
              Or call {site.company.phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
