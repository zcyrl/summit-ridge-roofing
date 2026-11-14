import { createFileRoute } from "@tanstack/react-router";
import { validateEstimate } from "#/lib/validation";

export const Route = createFileRoute("/api/estimate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json(
            { ok: false, error: "Send a JSON body.", fields: {} },
            { status: 400 },
          );
        }

        const parsed = validateEstimate(body);
        if (!parsed.ok) {
          return Response.json(
            {
              ok: false,
              error: "Check the highlighted fields and try again.",
              fields: parsed.errors,
            },
            { status: 400 },
          );
        }

        try {
          const { createLead } = await import("#/lib/whop.server");
          const lead = await createLead(parsed.value);
          return Response.json({
            ok: true,
            leadId: lead.memberId,
            eventId: lead.leadEventId,
            demo: lead.demo,
            warning: lead.warning,
          });
        } catch (error) {
          const status =
            error && typeof error === "object" && "status" in error
              ? Number(error.status) || 500
              : 500;
          const message =
            error instanceof Error ? error.message : "The request could not be sent.";
          console.error("[estimate] lead creation failed", message);
          return Response.json(
            {
              ok: false,
              error: message,
              fields: {},
            },
            { status: status >= 400 && status < 600 ? status : 500 },
          );
        }
      },
    },
  },
});
