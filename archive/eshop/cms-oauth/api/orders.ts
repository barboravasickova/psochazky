import { IncomingMessage, ServerResponse } from "http";
import { createNotionOrder, ShopOrder } from "../lib/notion-orders";

const ALLOWED_ORIGINS = new Set([
  "https://psochazky.cz",
  "https://www.psochazky.cz",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
]);

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function setCorsHeaders(req: IncomingMessage, res: ServerResponse) {
  const origin = String(req.headers.origin || "");
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

function jsonResponse(
  res: ServerResponse,
  statusCode: number,
  payload: Record<string, unknown>
) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function validateOrder(order: ShopOrder | null) {
  if (!order || typeof order !== "object") {
    return "Chyb├ş data objedn├ívky.";
  }
  if (!order.customer || !String(order.customer.email || "").trim()) {
    return "Chyb├ş e-mail z├íkazn├şka.";
  }
  if (!order.customer.name || !String(order.customer.name).trim()) {
    return "Chyb├ş jm├ęno z├íkazn├şka.";
  }
  if (!Array.isArray(order.items) || !order.items.length) {
    return "Ko┼í├şk je pr├ízdn├Ż.";
  }
  return "";
}

export default async (req: IncomingMessage, res: ServerResponse) => {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    jsonResponse(res, 405, { ok: false, error: "Pouze POST." });
    return;
  }

  try {
    const raw = await readBody(req);
    const order = JSON.parse(raw || "{}") as ShopOrder;
    const validationError = validateOrder(order);
    if (validationError) {
      jsonResponse(res, 400, { ok: false, error: validationError });
      return;
    }

    await createNotionOrder(order);
    jsonResponse(res, 200, { ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nezn├ím├í chyba serveru.";
    jsonResponse(res, 500, { ok: false, error: message });
  }
};
