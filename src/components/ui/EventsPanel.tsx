import { useEffect, useState } from "react";
import { site } from "../../../config/site";
import {
  TRACK_EVENT_NAME,
  type TrackedEvent,
} from "../../lib/tracking";
import { Close } from "./Icons";

/**
 * The recording aid: every custom event routed through lib/tracking is listed
 * here with its payload. It is always on in dev, and can be opened on a live
 * site with ?events=1 so the demo can show events firing on whop.app.
 */
export function EventsPanel() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(true);
  const [events, setEvents] = useState<TrackedEvent[]>([]);

  useEffect(() => {
    const queryEnabled = new URLSearchParams(window.location.search).has(
      site.tracking.panelQueryParam,
    );
    const shouldShow = import.meta.env.DEV || queryEnabled;
    setEnabled(shouldShow);
    if (!shouldShow) return;

    setEvents(window.__roofingEvents ?? []);

    const onEvent = (event: Event) => {
      const detail = (event as CustomEvent<TrackedEvent>).detail;
      setEvents((current) => [...current, detail]);
    };
    window.addEventListener(TRACK_EVENT_NAME, onEvent);
    return () => window.removeEventListener(TRACK_EVENT_NAME, onEvent);
  }, []);

  if (!enabled) return null;

  if (!open) {
    return (
      <button
        type="button"
        className="events-reopen"
        onClick={() => setOpen(true)}
        aria-label={`Open event log, ${events.length} events`}
      >
        Events <span>{events.length}</span>
      </button>
    );
  }

  return (
    <aside className="events-panel" aria-label="Whop event log (development only)">
      <div className="events-head">
        <div>
          <p className="mono-label">Whop events</p>
          <p className="events-count">{events.length} captured</p>
        </div>
        <div className="events-actions">
          <button
            type="button"
            className="events-clear"
            onClick={() => {
              window.__roofingEvents = [];
              setEvents([]);
            }}
          >
            Clear
          </button>
          <button
            type="button"
            className="events-close"
            onClick={() => setOpen(false)}
            aria-label="Close event log"
          >
            <Close size={16} />
          </button>
        </div>
      </div>
      {events.length === 0 ? (
        <p className="events-empty">
          Interact with the estimator, a service card or the estimate form.
        </p>
      ) : (
        <ol className="events-list">
          {events.map((event) => (
            <li key={event.id}>
              <div className="events-row">
                <code>{event.name}</code>
                <time dateTime={event.at}>
                  {new Date(event.at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </time>
              </div>
              {Object.keys(event.payload).length > 0 && (
                <pre>{JSON.stringify(event.payload, null, 0)}</pre>
              )}
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
