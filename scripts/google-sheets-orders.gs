/**
 * Google Apps Script – Psocházky objednávky → Google Tabulka
 * Záložka: Objednávky (nebo upravte SHEET_NAME)
 *
 * Sloupce A–X:
 * A Číslo | B Datum | C Jméno | D E-mail | E Telefon | F Ulice | G Město | H PSČ
 * I Faktura stejná | J–L Faktura adresa | M Položky | N Doprava | O Pobočka Zásilkovny
 * P Packeta ID | Q Platba | R Mezisoučet | S Doprava Kč | T Celkem | U VS
 * V Poznámka zákazníka | W Stav | X Interní poznámka
 * Y Kontrola = vzorec v tabulce (skript nezapisuje)
 */
const SHEET_NAME = "Objednávky";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
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
      orderNumber,                                      // A
      new Date(),                                       // B
      customer.name || "",                              // C
      customer.email || "",                             // D
      customer.phone || "",                             // E
      customer.street || "",                            // F
      customer.city || "",                              // G
      customer.zip || "",                               // H
      customer.billingSameAsDelivery ? "Ano" : "Ne",    // I
      customer.billingStreet || "",                     // J
      customer.billingCity || "",                       // K
      customer.billingZip || "",                        // L
      items,                                            // M
      shippingLabel,                                    // N
      customer.zasilkovnaPoint || "",                   // O
      packetaId,                                        // P
      paymentLabel,                                     // Q
      Number(data.subtotal || 0),                       // R
      Number(data.shippingCost || 0),                   // S
      Number(data.total || 0),                          // T
      vs,                                               // U
      customer.note || "",                              // V
      "Nová",                                           // W
      "",                                               // X
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({
        ok: true,
        orderNumber: orderNumber,
        variableSymbol: vs,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
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
