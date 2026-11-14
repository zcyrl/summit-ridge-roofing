/**
 * Client-side wrapper around the Whop pixel.
 *
 * The pixel is injected automatically on whop.app / whop.site pages, so there
 * is nothing to install. Every custom event goes through this function: it
 * forwards to whop.track, mirrors the event to the dev panel, and never throws
 * if the pixel is unavailable (local Vite dev, blockers, preview builds).
 */

export type TrackPayload = Record<string, unknown> & {
  service?: string;
  value?: number;
  currency?: string;
  event_id?: string;
};

export type TrackedEvent = {
  id: string;
  name: string;
  payload: TrackPayload;
  at: string;
};

declare global {
  interface Window {
    whop?: {
      track?: (name: string, payload?: Record<string, unknown>) => void;
      [key: string]: unknown;
    };
    __roofingEvents?: TrackedEvent[];
  }
}

export const TRACK_EVENT_NAME = "roofing:event";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function track(name: string, payload: TrackPayload = {}): TrackedEvent | null {
  if (typeof window === "undefined") return null;

  const event: TrackedEvent = {
    id: makeId(),
    name,
    payload,
    at: new Date().toISOString(),
  };

  try {
    window.whop?.track?.(name, payload);
  } catch (error) {
    // A blocked pixel must never break the page.
    console.warn(`[whop.track] ${name} could not be sent`, error);
  }

  window.__roofingEvents = [...(window.__roofingEvents ?? []), event];
  window.dispatchEvent(new CustomEvent<TrackedEvent>(TRACK_EVENT_NAME, { detail: event }));

  if (import.meta.env.DEV) {
    console.info(`[whop.track] ${name}`, payload);
  }

  return event;
}

/** Track a service card once per page load, even if it is viewed and clicked. */
const viewedServices = new Set<string>();

export function trackService(service: string, source: "view" | "click") {
  const key = service.toLowerCase();
  if (viewedServices.has(key)) return;
  viewedServices.add(key);
  track("service_viewed", { service, source });
}
