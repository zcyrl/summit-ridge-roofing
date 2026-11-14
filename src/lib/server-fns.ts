import { createServerFn } from "@tanstack/react-start";

/**
 * Public Whop configuration for the browser. The account ID is not a secret:
 * Whop Elements needs it to mount. API keys stay in the server runtime.
 */
export const loadWhopConfig = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicWhopConfig } = await import("./whop.server");
  return getPublicWhopConfig();
});
