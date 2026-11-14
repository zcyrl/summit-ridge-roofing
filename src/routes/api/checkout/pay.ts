import { createFileRoute } from "@tanstack/react-router";
import { validateCheckoutToken } from "#/lib/validation";

export const Route = createFileRoute("/api/checkout/pay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json(
            { ok: false, error: "Send a JSON body." },
            { status: 400 },
          );
        }

        const parsed = validateCheckoutToken(body);
        if (!parsed.ok) {
          return Response.json(
            { ok: false, error: Object.values(parsed.errors)[0], fields: parsed.errors },
            { status: 400 },
          );
        }

        try {
          const { createCheckoutPayment } = await import("#/lib/whop.server");
          const planKey = parsed.value.planKey as "inspection" | "tuneUp" | "deposit";
          const payment = await createCheckoutPayment({
            planKey,
            confirmationToken: parsed.value.confirmationToken,
            returnUrl: parsed.value.returnUrl,
            requestId: parsed.value.requestId,
          });

          return Response.json({
            ok: true,
            payment: {
              id: payment.id,
              status: payment.status,
              clientSecret: payment.clientSecret,
              amount: payment.amount,
              currency: payment.currency,
            },
          });
        } catch (error) {
          const status =
            error && typeof error === "object" && "status" in error
              ? Number(error.status) || 500
              : 500;
          const message =
            error instanceof Error ? error.message : "The payment could not be started.";
          console.error("[checkout] payment creation failed", message);
          return Response.json(
            { ok: false, error: message },
            { status: status >= 400 && status < 600 ? status : 500 },
          );
        }
      },
    },
  },
});
