import { Link } from "@tanstack/react-router";
import { site } from "../../../config/site";
import { Estimator } from "./Estimator";
import { ImageSlot, RoofArt } from "../ui/ImageSlot";
import { RoofScene } from "../ui/RoofScene";
import { ArrowRight, CheckCircle, ShieldCheck, Star } from "../ui/Icons";

function TrustTiles() {
  const tiles = [
    {
      label: "License",
      value: site.company.license,
      note: `${site.company.licenseState} licensed`,
      icon: <ShieldCheck size={18} />,
    },
    {
      label: "Insured",
      value: site.company.insured,
      note: "General liability + workers’ comp",
      icon: <CheckCircle size={18} />,
    },
    {
      label: "Warranty",
      value: site.company.warranty,
      note: "In writing, on every install",
      icon: <ShieldCheck size={18} />,
    },
    {
      label: "Reviews",
      value: site.reviews.average,
      note: site.reviews.count,
      icon: <Star size={18} filled />,
    },
  ];

  return (
    <div className="trust-grid">
      {tiles.map((tile) => (
        <div className="trust-tile" key={tile.label}>
          <div className="trust-tile-head">
            <span className="mono-label">{tile.label}</span>
            <span className="trust-icon" aria-hidden="true">
              {tile.icon}
            </span>
          </div>
          <p className="trust-value">{tile.value}</p>
          <p className="trust-note">{tile.note}</p>
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="mono-label hero-eyebrow">{site.copy.heroEyebrow}</p>
            <h1 id="hero-title">
              {site.copy.heroTitleLead}{" "}
              <em>{site.copy.heroTitleAccent}</em>{" "}
              <br className="hero-break" />
              {site.copy.heroTitleTail}
            </h1>
            <p className="hero-body">{site.copy.heroBody}</p>
            <div className="hero-actions">
              <a className="btn btn-primary btn-lg" href="#estimate">
                {site.copy.primaryCta}
                <ArrowRight size={18} />
              </a>
              <Link
                className="btn btn-ghost btn-lg"
                to="/checkout/$planKey"
                params={{ planKey: "inspection" }}
              >
                {site.copy.secondaryCta}
              </Link>
            </div>
            <p className="hero-footnote">
              <span className="hero-footnote-dot" aria-hidden="true" />
              Reply {site.serviceArea.responseTime}. No call centre.
            </p>
          </div>

          <div className="hero-visual">
            <RoofScene />
            {site.images.hero.src && (
              <div className="hero-photo">
                <ImageSlot
                  src={site.images.hero.src}
                  alt={site.images.hero.alt}
                  eager
                  fallback={<RoofArt variant="metal" />}
                />
                <span className="hero-photo-label mono-label">
                  {site.images.hero.label}
                </span>
              </div>
            )}
            <span className="hero-visual-corner mono-label" aria-hidden="true">
              {site.serviceArea.region}
            </span>
          </div>
        </div>

        <div className="hero-lower">
          <Estimator />
          <TrustTiles />
        </div>
      </div>
    </section>
  );
}
