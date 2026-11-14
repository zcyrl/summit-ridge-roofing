import type { SVGProps } from "react";
import type { ServiceIcon as ServiceIconName } from "../../../config/site";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    ...props,
  };
}

export function ArrowRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowUpRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

export function Phone(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.6 3.8 9 8.2 7.3 10a14.6 14.6 0 0 0 6.7 6.7l1.8-1.7 4.4 2.4-.7 2.2a2 2 0 0 1-2.2 1.3C10.3 19.9 4.1 13.7 3.3 6.7A2 2 0 0 1 4.6 4.5l2-.7Z" />
    </svg>
  );
}

export function Sun(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function Moon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20.4 14.5A8.4 8.4 0 0 1 9.5 3.6 8.5 8.5 0 1 0 20.4 14.5Z" />
    </svg>
  );
}

export function Menu(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function Close(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function Check(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5 12.5 4.2 4.2L19 6.8" />
    </svg>
  );
}

export function CheckCircle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.2 2.6 2.6L16.4 9" />
    </svg>
  );
}

export function ShieldCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function Clock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function Pin(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function Search(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.4 15.4 5.1 5.1" />
    </svg>
  );
}

export function Star({ filled = true, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg
      {...base(props)}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.3}
    >
      <path d="m12 3.2 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3.2Z" />
    </svg>
  );
}

export function Stars({
  count = 5,
  label,
  size = 16,
}: {
  count?: number;
  label?: string;
  size?: number;
}) {
  return (
    <span
      className="stars"
      role="img"
      aria-label={label ?? `${count} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={size} filled={index < count} />
      ))}
    </span>
  );
}

export function Spark(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v5M12 16v5M3 12h5M16 12h5" />
    </svg>
  );
}

export function Contactless(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8.5 8.5a5 5 0 0 1 0 7" />
      <path d="M11.4 6a9 9 0 0 1 0 12" />
      <path d="M14.3 3.4a13 13 0 0 1 0 17.2" />
    </svg>
  );
}

export function ServiceGlyph({
  name,
  size = 44,
}: {
  name: ServiceIconName;
  size?: number;
}) {
  if (name === "repair") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M8 23 24 9l16 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 23v16h24V23"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 23 24 9l16 14"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity=".55"
        />
        <path
          d="M17 12h8M17 16h5"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="31" cy="27" r="4" stroke="var(--accent)" strokeWidth="2" />
        <path
          d="m34 30 3 3"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "replacement") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M7 21 24 7l17 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m11 31 13-11 13 11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m15 40 9-8 9 8"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 21 24 7l17 14"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity=".5"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="21" cy="21" r="12" stroke="currentColor" strokeWidth="2" />
      <path
        d="m30 30 9 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15 21h12M21 15v12"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M33 14h6M36 11v6"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
