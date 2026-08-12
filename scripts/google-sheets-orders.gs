/**
 * Google Apps Script – Psocházky objednávky → Google Tabulka
 * Záložka: Objednávky (nebo upravte SHEET_NAME)
 *
 * Po úpravě: Uložit → Nasadit → Spravovat nasazení → Nová verze → Nasadit
 * Přístup: Kdokoli (Anyone).
 */
const SHEET_NAME = "Objednávky";

function doPost(e) {
  var raw = readRequestBody_(e);
  if (!raw) {
    return respond_({ ok: false, error: "Chybí data objednávky" }, e);
  }
  return respond_(writeOrderFromJson_(raw), e);
}

function doGet(e) {
  if (e && e.parameter && e.parameter.data) {
    var result = writeOrderFromJson_(e.parameter.data);

    if (e.parameter.callback) {
      return jsonpResponse_(e.parameter.callback, result);
    }

    if (e.parameter.returnUrl) {
      return redirectResponse_(result, e.parameter.returnUrl, e.parameter.errorUrl);
    }

    return respond_(result, e);
  }

  return jsonResponse_({ ok: false, error: "Použijte POST nebo parametr ?data=" });
}

function readRequestBody_(e) {
  if (e && e.parameter && e.parameter.payload) {
    return e.parameter.payload;
  }
  if (e && e.postData && e.postData.contents) {
    var type = String((e.postData && e.postData.type) || "");
    if (type.indexOf("application/x-www-form-urlencoded") >= 0) {
      return "";
    }
    return e.postData.contents;
  }
  return "";
}

function writeOrderFromJson_(raw) {
  try {
    const data = JSON.parse(raw);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('List "' + SHEET_NAME + '" nenalezen');
    }

    const orderNumber = nextOrderNumber_(sheet);
    const vs =
      String(data.variableSymbol || "") ||
      orderNumber.replace(/\D/g, "").slice(-10);
    const customer = data.customer || {};
    const items = (data.items || [])
      .map(function (item) {
        var title = item.title || "";
        var parts = [];
        if (item.color) parts.push("Barva: " + item.color);
        if (item.size) parts.push("Velikost: " + item.size);
        if (parts.length) title += " (" + parts.join(", ") + ")";
        var lineTotal =
          typeof item.price === "number" && typeof item.quantity === "number"
            ? item.price * item.quantity
            : 0;
        return title + " × " + (item.quantity || 1) + " — " + lineTotal + " Kč";
      })
      .join("\n");

    const shippingLabel =
      data.shipping === "zasilkovna" ? "Zásilkovna" : "Osobní odběr (Brno)";
    const paymentLabel = data.payment === "cash" ? "Hotově" : "Převodem";
    const packetaId =
      customer.packetaBranch && customer.packetaBranch.id
        ? String(customer.packetaBranch.id)
        : "";

    const row = [
      orderNumber,
      new Date(),
      customer.name || "",
      customer.email || "",
      customer.phone || "",
      customer.street || "",
      customer.city || "",
      customer.zip || "",
      customer.billingSameAsDelivery ? "Ano" : "Ne",
      customer.billingStreet || "",
      customer.billingCity || "",
      customer.billingZip || "",
      items,
      shippingLabel,
      customer.zasilkovnaPoint || "",
      packetaId,
      paymentLabel,
      Number(data.subtotal || 0),
      Number(data.shippingCost || 0),
      Number(data.total || 0),
      vs,
      customer.note || "",
      "Nová",
      "",
    ];

    sheet.appendRow(row);

    return {
      ok: true,
      orderNumber: orderNumber,
      variableSymbol: vs,
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function respond_(result, e) {
  if (e && e.parameter && e.parameter.delivery === "iframe") {
    return htmlPostMessageResponse_(result);
  }
  return jsonResponse_(result);
}

function redirectResponse_(result, returnUrl, errorUrl) {
  var target;
  if (result.ok) {
    var separator = returnUrl.indexOf("?") >= 0 ? "&" : "?";
    target =
      returnUrl +
      separator +
      "orderNumber=" +
      encodeURIComponent(result.orderNumber) +
      "&variableSymbol=" +
      encodeURIComponent(result.variableSymbol);
  } else {
    var fallback = errorUrl || returnUrl;
    var errorSeparator = fallback.indexOf("?") >= 0 ? "&" : "?";
    target =
      fallback +
      errorSeparator +
      "orderError=" +
      encodeURIComponent(result.error || "Uložení objednávky se nezdařilo.");
  }

  return HtmlService.createHtmlOutput(
    "<!doctype html><html lang=\"cs\"><head><meta charset=\"utf-8\">" +
      "<title>Odesílám objednávku…</title></head><body>" +
      "<p style=\"font:600 1rem/1.5 sans-serif;text-align:center;margin:3rem 1rem;color:#0b3329\">" +
      "Odesílám objednávku…</p>" +
      "<script>window.location.replace(" +
      JSON.stringify(target) +
      ");</script></body></html>"
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function jsonpResponse_(callback, obj) {
  if (!/^[A-Za-z_$][\w$]*$/.test(String(callback || ""))) {
    return jsonResponse_({ ok: false, error: "Neplatný callback" });
  }
  return ContentService.createTextOutput(
    callback + "(" + JSON.stringify(obj) + ");"
  ).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function htmlPostMessageResponse_(obj) {
  var payload = JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return HtmlService.createHtmlOutput(
    "<!doctype html><meta charset=\"utf-8\"><script>window.parent.postMessage(" +
      payload +
      ', "*");</script>'
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function nextOrderNumber_(sheet) {
  const year = new Date().getFullYear();
  const prefix = year + "-";
  const lastRow = sheet.getLastRow();
  let max = 0;

  if (lastRow >= 2) {
    const values = sheet.getRange(2, 1, lastRow, 1).getValues();
    values.forEach(function (row) {
      const val = String(row[0] || "");
      if (val.indexOf(prefix) === 0) {
        const num = parseInt(val.split("-")[1], 10);
        if (!isNaN(num) && num > max) max = num;
      }
    });
  }

  return prefix + String(max + 1).padStart(4, "0");
}
