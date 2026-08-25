type OrderItem = {
  title?: string;
  color?: string;
  size?: string;
  price?: number;
  quantity?: number;
};

type PacketaBranch = {
  id?: string | number;
  label?: string;
};

type ShopOrder = {
  orderNumber?: string;
  createdAt?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    street?: string;
    city?: string;
    zip?: string;
    billingSameAsDelivery?: boolean;
    billingStreet?: string;
    billingCity?: string;
    billingZip?: string;
    note?: string;
    zasilkovnaPoint?: string;
    packetaBranch?: PacketaBranch | null;
  };
  shipping?: string;
  payment?: string;
  variableSymbol?: string;
  items?: OrderItem[];
  subtotal?: number;
  shippingCost?: number;
  total?: number;
};

function richText(value: string) {
  const text = String(value || "").trim();
  if (!text) return { rich_text: [] as { text: { content: string } }[] };

  const chunks: { text: { content: string } }[] = [];
  for (let i = 0; i < text.length; i += 2000) {
    chunks.push({ text: { content: text.slice(i, i + 2000) } });
  }
  return { rich_text: chunks };
}

function formatItems(items: OrderItem[] | undefined) {
  return (items || [])
    .map((item) => {
      let title = item.title || "";
      const parts: string[] = [];
      if (item.color) parts.push("Barva: " + item.color);
      if (item.size) parts.push("Velikost: " + item.size);
      if (parts.length) title += " (" + parts.join(", ") + ")";
      const lineTotal =
        typeof item.price === "number" && typeof item.quantity === "number"
          ? item.price * item.quantity
          : 0;
      return title + " ├Ś " + (item.quantity || 1) + " ÔÇö " + lineTotal + " K─Ź";
    })
    .join("\n");
}

function shippingLabel(order: ShopOrder) {
  if (order.shipping === "zasilkovna") return "Z├ísilkovna";
  return "Osobn├ş odb─Ťr (Brno)";
}

function paymentLabel(order: ShopOrder) {
  if (order.payment === "cash") return "Hotov─Ť p┼Öi p┼Öevzet├ş";
  return "Platba p┼Öevodem";
}

export function buildNotionOrderProperties(order: ShopOrder) {
  const customer = order.customer || {};
  const orderNumber = String(order.orderNumber || "").trim();
  const createdAt = order.createdAt || new Date().toISOString();
  const variableSymbol =
    String(order.variableSymbol || "") ||
    orderNumber.replace(/\D/g, "").slice(-10);

  return {
    "─î├şslo objedn├ívky": {
      title: [{ text: { content: orderNumber || "Bez ─Ź├şsla" } }],
    },
    "Datum a ─Źas": {
      date: { start: createdAt },
    },
    Jm├ęno: richText(customer.name || ""),
    "E-mail": customer.email ? { email: customer.email } : { email: null },
    Telefon: customer.phone
      ? { phone_number: customer.phone }
      : { phone_number: null },
    Ulice: richText(customer.street || ""),
    M─Ťsto: richText(customer.city || ""),
    PS─î: richText(customer.zip || ""),
    "Faktura stejn├í": {
      select: { name: customer.billingSameAsDelivery ? "Ano" : "Ne" },
    },
    "Faktura ulice": richText(customer.billingStreet || ""),
    "Faktura m─Ťsto": richText(customer.billingCity || ""),
    "Faktura PS─î": richText(customer.billingZip || ""),
    Polo┼żky: richText(formatItems(order.items)),
    Doprava: { select: { name: shippingLabel(order) } },
    "Pobo─Źka Z├ísilkovny": richText(customer.zasilkovnaPoint || ""),
    "Packeta ID": richText(
      customer.packetaBranch && customer.packetaBranch.id != null
        ? String(customer.packetaBranch.id)
        : ""
    ),
    Platba: { select: { name: paymentLabel(order) } },
    Mezisou─Źet: richText(String(order.subtotal ?? 0)),
    "Doprava K─Ź": richText(String(order.shippingCost ?? 0)),
    Celkem: richText(String(order.total ?? 0)),
    VS: richText(variableSymbol),
    Pozn├ímka: richText(customer.note || ""),
    Stav: { select: { name: "Nov├í" } },
  };
}

export async function createNotionOrder(order: ShopOrder) {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_ORDERS_DATABASE_ID;

  if (!token || !databaseId) {
    throw new Error("Chyb├ş NOTION_TOKEN nebo NOTION_ORDERS_DATABASE_ID na serveru.");
  }

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: buildNotionOrderProperties(order),
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (payload && payload.message) ||
      "Notion API vr├ítilo chybu " + response.status;
    throw new Error(message);
  }

  return payload;
}

export type { ShopOrder };
