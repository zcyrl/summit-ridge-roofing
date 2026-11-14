import { useState } from "react";
import { site } from "../../../config/site";
import { Check, Pin } from "../ui/Icons";

type ZipResult = "idle" | "in" | "out" | "error";

export function ServiceArea() {
  const [zip, setZip] = useState("");
  const [result, setResult] = useState<ZipResult>("idle");

  function check(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = zip.trim();
    if (!/^\d{5}$/.test(value)) {
      setResult("error");
      return;
    }
    setResult((site.serviceArea.zips as readonly string[]).includes(value) ? "in" : "out");
  }

  return (
    <section className="area-card" id="area" aria-labelledby="area-title">
      <div className="area-head">
        <div>
          <p className="mono-label">
            <Pin size={14} /> Service area
          </p>
          <h2 id="area-title">
            Local, and <em>close by.</em>
          </h2>
        </div>
        <p className="area-radius">
          <span>{site.serviceArea.radius}</span>
          around {site.serviceArea.region}
        </p>
      </div>

      <form className="zip-form" onSubmit={check} noValidate>
        <label htmlFor="zip-check">Check your ZIP</label>
        <div className="zip-row">
          <input
            id="zip-check"
            name="zip"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            placeholder={site.serviceArea.zips[0] ?? "00000"}
            value={zip}
            onChange={(event) => {
              setZip(event.target.value.replace(/[^\d]/g, ""));
              setResult("idle");
            }}
            aria-describedby="zip-result"
          />
          <button type="submit" className="btn btn-primary">
            Check ZIP
          </button>
        </div>
      </form>

      <div id="zip-result" className={`zip-result is-${result}`} aria-live="polite">
        {result === "idle" && (
          <p className="zip-idle">
            We serve {site.serviceArea.cities.slice(0, 4).join(" · ")} and
            nearby.
          </p>
        )}
        {result === "error" && (
          <p>
            <strong>Enter a 5-digit ZIP code.</strong> Then we can check the
            route.
          </p>
        )}
        {result === "in" && (
          <p className="zip-in">
            <Check size={18} />
            <span>
              <strong>We serve you.</strong> Book an inspection or request a
              quote — both are answered {site.serviceArea.responseTime}.
            </span>
          </p>
        )}
        {result === "out" && (
          <p>
            <strong>Outside our area.</strong> Request a callback anyway — we may
            still be able to help, or point you to someone who can.
          </p>
        )}
      </div>

      {result === "out" && (
        <a className="text-link zip-callback" href="#estimate">
          Request a callback anyway
        </a>
      )}

      <div className="area-cities" aria-label="Cities we serve">
        {site.serviceArea.cities.map((city, index) => (
          <span key={`${city}-${index}`}>{city}</span>
        ))}
      </div>
    </section>
  );
}
