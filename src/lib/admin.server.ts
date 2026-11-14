import { timingSafeEqual } from "node:crypto";

/**
 * Minimal gate for the owner-only invoice tool. This is a template: replace
 * this with your normal auth (Whop OAuth, team roles, or a signed session) if
 * you put the admin page behind a real login. Never expose ADMIN_KEY in the
 * browser bundle; it is typed in once per session and sent in a header.
 */
export function adminKeyFromRequest(request: Request): string | null {
  const expected = process.env.ADMIN_KEY?.trim();
  if (!expected) {
    throw new AdminAuthError(
      "ADMIN_KEY is not configured. Add it with `whop apps secrets set --secret ADMIN_KEY=...`.",
      503,
    );
  }

  const provided = request.headers.get("x-admin-key")?.trim() ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new AdminAuthError("The admin key is incorrect.", 401);
  }
  return provided;
}

export class AdminAuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.name = "AdminAuthError";
    this.status = status;
  }
}
