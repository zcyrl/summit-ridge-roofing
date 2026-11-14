import { Link } from "@tanstack/react-router";
import { site } from "../../../config/site";

export function RoofMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="roof-mark"
    >
      <path
        d="M4 23 20 8l16 15"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 23v11h22V23"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 23 20 8l16 15"
        stroke="var(--accent)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity=".55"
      />
      <circle cx="31" cy="11" r="4" fill="var(--accent)" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`logo ${className}`}>
      <RoofMark size={28} />
      <span className="logo-word">
        <em>{site.company.logo.leading}</em>{" "}
        {site.company.logo.trailing}
      </span>
    </Link>
  );
}
