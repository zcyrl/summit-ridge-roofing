/**
 * Tiny client-side store that carries the estimator selection into the
 * estimate form. It also mirrors the selection to sessionStorage so a reload
 * keeps the prefill. A module store avoids relying on DOM CustomEvents, which
 * are easy to lose across React StrictMode's mount/unmount cycle.
 */
export type EstimatePrefill = {
  service?: string;
  notes?: string;
};

let pending: EstimatePrefill | null = null;
const listeners = new Set<(prefill: EstimatePrefill) => void>();

export function setEstimatePrefill(prefill: EstimatePrefill) {
  pending = prefill;
  try {
    window.sessionStorage.setItem("roofing-estimate-prefill", JSON.stringify(prefill));
  } catch {
    // Storage can be blocked; the in-memory store still works.
  }
  for (const listener of listeners) listener(prefill);
}

export function readStoredEstimatePrefill(): EstimatePrefill | null {
  if (pending) return pending;
  try {
    const raw = window.sessionStorage.getItem("roofing-estimate-prefill");
    if (!raw) return null;
    pending = JSON.parse(raw) as EstimatePrefill;
    return pending;
  } catch {
    return null;
  }
}

export function subscribeEstimatePrefill(
  listener: (prefill: EstimatePrefill) => void,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
