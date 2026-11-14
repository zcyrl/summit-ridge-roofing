import { useState, type ReactNode } from "react";

/**
 * A client-only image slot with a line-art fallback. Empty config paths render
 * the fallback, so the template looks finished before real photos are added.
 * Photos get a monochrome treatment in CSS and return to colour on hover.
 */
export function ImageSlot({
  src,
  alt,
  fallback,
  className = "",
  eager = false,
}: {
  src: string;
  alt: string;
  fallback: ReactNode;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`image-slot image-fallback ${className}`} role="img" aria-label={alt}>
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`image-slot ${className}`}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

/** Small line-art roof used in gallery and before/after fallbacks. */
export function RoofArt({ variant = "after" }: { variant?: "before" | "after" | "metal" | "flashing" }) {
  const isBefore = variant === "before";

  if (variant === "metal") {
    return (
      <svg viewBox="0 0 640 400" className="roof-art" aria-hidden="true" focusable="false">
        <rect width="640" height="400" fill="var(--card)" />
        <path d="M60 300 320 90l260 210" stroke="currentColor" strokeWidth="6" fill="none" />
        <path d="M120 300 320 138l200 162" stroke="currentColor" strokeWidth="3" fill="none" />
        <path d="M105 300v80h430v-80" stroke="currentColor" strokeWidth="6" fill="none" />
        {Array.from({ length: 9 }).map((_, index) => (
          <path
            key={index}
            d={`M${170 + index * 38} ${232 - index * 8} ${170 + index * 38} 300`}
            stroke="var(--accent)"
            strokeWidth="2"
            opacity=".6"
          />
        ))}
        <circle cx="505" cy="105" r="26" fill="var(--accent)" />
      </svg>
    );
  }

  if (variant === "flashing") {
    return (
      <svg viewBox="0 0 640 400" className="roof-art" aria-hidden="true" focusable="false">
        <rect width="640" height="400" fill="var(--card)" />
        <path d="M40 320 300 100l300 220" stroke="currentColor" strokeWidth="6" fill="none" />
        <path d="M40 320h560" stroke="currentColor" strokeWidth="2" opacity=".25" />
        <rect x="330" y="112" width="54" height="130" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M318 118h78M318 132h78" stroke="currentColor" strokeWidth="5" />
        <path d="M300 240c40 30 80 30 120 0" stroke="var(--accent)" strokeWidth="7" fill="none" strokeLinecap="round" />
        <circle cx="360" cy="248" r="10" fill="var(--accent)" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 640 400" className="roof-art" aria-hidden="true" focusable="false">
      <rect width="640" height="400" fill="var(--card)" />
      <path
        d={isBefore ? "M60 300 320 86l260 214" : "M60 300 320 76l260 224"}
        stroke="currentColor"
        strokeWidth="6"
        fill="none"
        strokeLinejoin="round"
      />
      <path d="M115 300v80h410v-80" stroke="currentColor" strokeWidth="6" fill="none" />
      <path
        d="M120 300 320 128l200 172"
        stroke={isBefore ? "currentColor" : "var(--accent)"}
        strokeWidth="3"
        fill="none"
        opacity={isBefore ? ".28" : ".85"}
      />
      {isBefore ? (
        <g>
          {Array.from({ length: 6 }).map((_, index) => (
            <rect
              key={index}
              x={150 + index * 48}
              y={278 - index * 9}
              width="34"
              height="10"
              fill="currentColor"
              opacity=".55"
            />
          ))}
          <path d="m250 250 26 26m0-26-26 26" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" />
          <path d="M300 285c38 22 72 18 98-8" stroke="var(--accent)" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M64 120h120M64 144h76" stroke="currentColor" strokeWidth="4" opacity=".35" />
        </g>
      ) : (
        <g>
          <rect x="284" y="330" width="72" height="50" fill="none" stroke="var(--accent-2)" strokeWidth="6" />
          <path d="M320 330v50" stroke="var(--accent-2)" strokeWidth="3" />
          <circle cx="500" cy="92" r="28" fill="var(--accent)" />
          {Array.from({ length: 8 }).map((_, index) => {
            const angle = (Math.PI * 2 * index) / 8;
            return (
              <path
                key={index}
                d={`M${500 + Math.cos(angle) * 40} ${92 + Math.sin(angle) * 40}L${
                  500 + Math.cos(angle) * 50
                } ${92 + Math.sin(angle) * 50}`}
                stroke="var(--accent)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}
          <path d="M58 100h100M58 124h64" stroke="currentColor" strokeWidth="4" opacity=".35" />
        </g>
      )}
    </svg>
  );
}
