import { useRef, useState } from "react";
import {
  formatUsd,
  formatUsdRange,
  site,
  type Material,
} from "../../../config/site";
import { setEstimatePrefill } from "../../lib/prefill";
import { track } from "../../lib/tracking";
import { ArrowRight } from "../ui/Icons";

const MATERIALS = site.estimator.materials;

function priceFor(material: Material, sqft: number) {
  return {
    low: Math.round(material.lowPerSqFt * sqft),
    high: Math.round(material.highPerSqFt * sqft),
  };
}

export function Estimator() {
  const [sqft, setSqft] = useState<number>(site.estimator.defaultSqFt);
  const [materialId, setMaterialId] = useState<string>(MATERIALS[0].id);
  const material = MATERIALS.find((item) => item.id === materialId) ?? MATERIALS[0];
  const price = priceFor(material, sqft);
  const used = useRef(false);

  function markUsed() {
    if (used.current) return;
    used.current = true;
    track("service_viewed", { service: "estimator" });
  }

  function requestExactQuote() {
    setEstimatePrefill({
      service: "Replacement",
      notes: `Instant estimate: ${sqft.toLocaleString("en-US")} sq ft · ${material.name} (${material.description}) · ${formatUsdRange(price.low, price.high)}. Please confirm the exact scope.`,
    });
    const target = document.getElementById("estimate");
    target?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
    window.setTimeout(() => {
      const name = document.getElementById("estimate-name");
      if (name instanceof HTMLInputElement) name.focus({ preventScroll: true });
    }, 450);
  }

  const fill = ((sqft - site.estimator.minSqFt) /
    (site.estimator.maxSqFt - site.estimator.minSqFt)) *
    100;

  return (
    <section className="estimator" aria-labelledby="estimator-title">
      <div className="estimator-top">
        <div>
          <p className="mono-label" id="estimator-title">
            {site.estimator.label} <span className="dot" aria-hidden="true">·</span> Sample rates
          </p>
          <p className="estimator-price" aria-live="polite">
            {formatUsdRange(price.low, price.high)}
          </p>
        </div>
        <p className="estimator-size">
          {sqft.toLocaleString("en-US")} <span>sq ft</span>
        </p>
      </div>

      <div className="range-group">
        <label className="range-label" htmlFor="roof-size">
          Roof size
          <span>{sqft.toLocaleString("en-US")} sq ft</span>
        </label>
        <div className="range-wrap" style={{ ["--fill" as string]: `${fill}%` }}>
          <div className="range-rail" aria-hidden="true">
            <span style={{ width: `${fill}%` }} />
          </div>
          <input
            id="roof-size"
            className="range"
            type="range"
            min={site.estimator.minSqFt}
            max={site.estimator.maxSqFt}
            step={site.estimator.step}
            value={sqft}
            onChange={(event) => {
              markUsed();
              setSqft(Number(event.target.value));
            }}
            onPointerDown={markUsed}
            onKeyDown={markUsed}
            aria-valuetext={`${sqft.toLocaleString("en-US")} square feet`}
          />
        </div>
        <div className="range-ends mono-label" aria-hidden="true">
          <span>{site.estimator.minSqFt.toLocaleString("en-US")} sq ft</span>
          <span>{site.estimator.maxSqFt.toLocaleString("en-US")} sq ft</span>
        </div>
      </div>

      <div className="estimator-bottom">
        <div className="chips" role="radiogroup" aria-label="Roof material">
          {MATERIALS.map((item) => (
            <label
              key={item.id}
              className={`chip ${item.id === material.id ? "is-active" : ""}`}
            >
              <input
                type="radio"
                name="roof-material"
                value={item.id}
                checked={item.id === material.id}
                onChange={() => {
                  markUsed();
                  setMaterialId(item.id);
                }}
              />
              <span>{item.name}</span>
            </label>
          ))}
        </div>

        <button type="button" className="btn btn-ghost estimator-cta" onClick={requestExactQuote}>
          {site.copy.estimatorCta}
          <ArrowRight size={17} />
        </button>
      </div>

      <p className="estimator-note">
        {material.name} · {formatUsd(material.lowPerSqFt)}–{formatUsd(material.highPerSqFt)}{" "}
        / sq ft. <strong>Estimate only.</strong> {site.estimator.disclaimer}
      </p>
    </section>
  );
}
