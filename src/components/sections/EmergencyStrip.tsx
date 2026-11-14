import { site } from "../../../config/site";
import { Phone } from "../ui/Icons";

export function EmergencyStrip() {
  return (
    <a className="emergency" href={site.company.phoneHref}>
      <span className="emergency-inner">
        <span className="emergency-pulse" aria-hidden="true" />
        <span className="emergency-text">
          {site.copy.emergency} <span className="emergency-sep">·</span>{" "}
          <span className="emergency-phone">
            <Phone size={13} /> {site.company.phone}
          </span>
        </span>
      </span>
    </a>
  );
}
