/**
 * Creates the three Whop plans this template sells, then prints (or writes)
 * the plan IDs into config/site.ts.
 *
 *   npm run plans:create
 *   npm run plans:create -- --write
 *
 * Uses the Current API (POST /products, POST /variants). Existing products and
 * variants with the same titles are reused, so re-running is safe.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { site } from "../config/site";

try {
  loadEnvFile(".env");
} catch {
  // .env is optional; on whop.app the variables are injected.
}

const ORIGIN = (process.env.WHOP_API_ORIGIN || "https://api.whop.com").replace(/\/+$/, "");
const API = `${ORIGIN}/api/v1`;
const KEY = process.env.WHOP_API_KEY?.trim();
const ACCOUNT = process.env.WHOP_ACCOUNT_ID?.trim() || site.whop.accountId;
const VERSION = process.env.WHOP_API_VERSION || "2026-11-13-1";
const WRITE = process.argv.includes("--write");

if (!KEY) {
  console.error("Missing WHOP_API_KEY. Create one at https://whop.com/dashboard/developer and put it in .env.");
  process.exit(1);
}
if (!ACCOUNT || ACCOUNT.includes("REPLACE")) {
  console.error("Missing WHOP_ACCOUNT_ID (biz_…). Add it to .env.");
  process.exit(1);
}

type Product = { id: string; title: string };
type Variant = { id: string; title: string | null; product_id?: string };

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Api-Version-Date": VERSION,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message =
      data?.error?.message || `HTTP ${response.status} ${response.statusText}`;
    throw new Error(`${init.method ?? "GET"} ${path}: ${message}`);
  }
  return data as T;
}

async function findProduct(title: string): Promise<Product | null> {
  const result = await api<{ data?: Product[] }>(
    `/products?account_id=${encodeURIComponent(ACCOUNT)}&first=100`,
  );
  return result.data?.find((product) => product.title === title) ?? null;
}

async function findVariant(productId: string, title: string): Promise<Variant | null> {
  const result = await api<{ data?: Variant[] }>(
    `/variants?account_id=${encodeURIComponent(ACCOUNT)}&product_ids=${encodeURIComponent(
      productId,
    )}&first=100`,
  );
  return result.data?.find((variant) => variant.title === title) ?? null;
}

async function main() {
  const productTitle = `${site.company.name} — roofing services`;
  let product = await findProduct(productTitle);

  if (!product) {
    product = await api<Product>("/products", {
      method: "POST",
      body: JSON.stringify({
        account_id: ACCOUNT,
        title: productTitle,
        headline: "Repair, replacement and inspection",
        description:
          "Fixed-scope roofing services sold through Whop Payments. Created by scripts/create-plans.ts.",
        visibility: "visible",
      }),
    });
    console.log(`Created product ${product.id} — ${product.title}`);
  } else {
    console.log(`Reusing product ${product.id} — ${product.title}`);
  }

  const created: Record<string, string> = {};

  for (const plan of Object.values(site.plans)) {
    let variant = await findVariant(product.id, plan.name);
    if (!variant) {
      variant = await api<Variant>("/variants", {
        method: "POST",
        body: JSON.stringify({
          account_id: ACCOUNT,
          product_id: product.id,
          title: plan.name,
          initial_price: plan.price,
          currency: "usd",
          billing_type: "one_time",
          release_method: "buy_now",
          visibility: "visible",
          unlimited_stock: true,
          metadata: { template_key: plan.key },
        }),
      });
      console.log(`Created ${plan.key}: ${variant.id} — ${plan.name} ($${plan.price})`);
    } else {
      console.log(`Reusing ${plan.key}: ${variant.id} — ${plan.name}`);
    }
    created[plan.key] = variant.id;
  }

  console.log("\nPlan IDs:\n");
  for (const [key, id] of Object.entries(created)) {
    console.log(`  ${key.padEnd(12)} ${id}`);
  }
  console.log(`  product      ${product.id}`);

  if (WRITE) {
    const file = "config/site.ts";
    let source = readFileSync(file, "utf8");
    const ids: Record<string, string> = {
      inspection: created.inspection,
      deposit: created.deposit,
      tuneUp: created.tuneUp,
    };

    source = source.replaceAll("plan_REPLACE_INSPECTION", ids.inspection);
    source = source.replaceAll("plan_REPLACE_DEPOSIT", ids.deposit);
    source = source.replaceAll("plan_REPLACE_TUNEUP", ids.tuneUp);
    source = source.replaceAll("prod_REPLACE_PRODUCT_ID", product.id);
    writeFileSync(file, source);
    console.log(`\nWrote the IDs into ${file}.`);
  } else {
    console.log("\nPaste these into config/site.ts, or re-run with --write.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
