import { site } from "../../../config/site";
import { Check } from "../ui/Icons";

export function Tracker() {
  const { steps, currentStep, eyebrow, note } = site.projectTracker;
  const progress = (currentStep / (steps.length - 1)) * 100;

  return (
    <aside className="tracker-card" aria-labelledby="tracker-title">
      <p className="mono-label" id="tracker-title">
        {eyebrow}
      </p>
      <p className="tracker-note">{note}</p>

      <ol className="tracker">
        {steps.map((step, index) => {
          const state =
            index < currentStep ? "done" : index === currentStep ? "current" : "upcoming";
          return (
            <li className={`tracker-step is-${state}`} key={step.label}>
              <span className="tracker-dot" aria-hidden="true">
                {state === "done" ? <Check size={13} /> : <span />}
              </span>
              <div className="tracker-copy">
                <p className="tracker-label">{step.label}</p>
                <p className="tracker-description">{step.description}</p>
              </div>
              {state === "current" && <span className="tracker-now mono-label">Now</span>}
            </li>
          );
        })}
        <span className="tracker-rail" aria-hidden="true">
          <span style={{ height: `${progress}%` }} />
        </span>
      </ol>

      <p className="tracker-footnote">
        Questions about a live job? Call {site.company.phone}. We answer during
        office hours.
      </p>
    </aside>
  );
}
