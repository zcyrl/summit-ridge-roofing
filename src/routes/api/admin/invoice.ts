import { createFileRoute } from "@tanstack/react-router";
import { validateInvoice } from "#/lib/validation";

export const Route = createFileRoute("/api/admin/invoice")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { adminKeyFromRequest } = await import("#/lib/admin.server");
          adminKeyFromRequest(request);

          let body: unknown;
          try {
            body = await request.json();
          } catch {
            return Response.json(
              { ok: false, error: "Send a JSON body." },
              { status: 400 },
            );
          }

          const parsed = validateInvoice(body);
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

          const { createFinalInvoice } = await import("#/lib/whop.server");
          const result = await createFinalInvoice(parsed.value);
          return Response.json({ ok: true, ...result });
        } catch (error) {
          const status =
            error && typeof error === "object" && "status" in error
              ? Number(error.status) || 500
              : 500;
          const message =
            error instanceof Error ? error.message : "The invoice could not be created.";
          console.error("[admin/invoice] failed", message);
          return Response.json(
            { ok: false, error: message },
            { status: status >= 400 && status < 600 ? status : 500 },
          );
        }
      },

      GET: async ({ request }) => {
        try {
          const { adminKeyFromRequest } = await import("#/lib/admin.server");
          adminKeyFromRequest(request);

          const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
          if (!id) {
            return Response.json(
              { ok: false, error: "Missing invoice ID." },
              { status: 400 },
            );
          }

          const { retrieveInvoice } = await import("#/lib/whop.server");
          const invoice = await retrieveInvoice(id);
          return Response.json({ ok: true, invoice });
        } catch (error) {
          const status =
            error && typeof error === "object" && "status" in error
              ? Number(error.status) || 500
              : 500;
          const message =
            error instanceof Error ? error.message : "The invoice could not be loaded.";
          return Response.json(
            { ok: false, error: message },
            { status: status >= 400 && status < 600 ? status : 500 },
          );
        }
      },
    },
  },
});
