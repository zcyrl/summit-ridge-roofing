import { createFileRoute, Link } from "@tanstack/react-router";
import { getPlan, resolvePlanKey, site } from "../../config/site";
import { loadWhopConfig } from "../lib/server-fns";
import { CheckoutClient } from "../components/checkout/CheckoutClient";

export const Route = createFileRoute("/checkout/$planKey")({
  loader: async () => loadWhopConfig(),
  head: () => ({
    meta: [
      { title: `Secure checkout — ${site.company.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { planKey: rawPlanKey } = Route.useParams();
  const config = Route.useLoaderData();
  const planKey = resolvePlanKey(rawPlanKey);

  if (!planKey) {
    return (
      <main className="not-found" id="main">
        <p className="mono-label">Checkout</p>
        <h1>
          That plan <em>does not exist.</em>
        </h1>
        <p>Choose an inspection, a deposit or a tune-up from the home page.</p>
        <Link className="btn btn-primary" to="/">
          Back to {site.company.name}
        </Link>
      </main>
    );
  }

  return (
    <CheckoutClient
      plan={getPlan(planKey)}
      accountId={config.accountId}
      demoMode={config.demoMode}
      environment={config.environment}
    />
  );
}
