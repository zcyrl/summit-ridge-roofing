import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/checkout/confirm")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const paymentId = url.searchParams.get("payment")?.trim() ?? "";
        if (!paymentId) {
          return Response.json(
            { ok: false, error: "Missing payment ID." },
            { status: 400 },
          );
        }

        try {
          const { getDepositSummary } = await import("#/lib/whop.server");
          const payment = await getDepositSummary(paymentId);
          return Response.json({ ok: true, payment });
        } catch (error) {
          const status =
            error && typeof error === "object" && "status" in error
              ? Number(error.status) || 500
              : 500;
          const message =
            error instanceof Error ? error.message : "The payment could not be loaded.";
          return Response.json(
            { ok: false, error: message },
            { status: status >= 400 && status < 600 ? status : 500 },
          );
        }
      },
    },
  },
});
