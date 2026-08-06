(function () {
  if (!window.ShopCart) return;

  var emptyEl = document.getElementById("shop-thanks-empty");
  var contentEl = document.getElementById("shop-thanks-content");
  var order = ShopCart.loadPreviewOrder();

  if (!order) {
    if (emptyEl) emptyEl.hidden = false;
    if (contentEl) contentEl.hidden = true;
    return;
  }

  if (emptyEl) emptyEl.hidden = true;
  if (contentEl) contentEl.hidden = false;

  document.getElementById("shop-thanks-order-number").textContent = order.orderNumber;
  document.getElementById("shop-thanks-email").textContent = order.customer.email;
  document.getElementById("shop-thanks-total").textContent = ShopCart.formatMoney(order.total);

  var itemsEl = document.getElementById("shop-thanks-items");
  if (itemsEl) {
    itemsEl.innerHTML = order.items
      .map(function (item) {
        return "<li>" + ShopCart.displayTitle(item) + " × " + item.quantity + "</li>";
      })
      .join("");
  }

  var qrWrap = document.getElementById("shop-thanks-qr");
  var qrCash = document.getElementById("shop-thanks-cash");
  if (order.payment === "transfer") {
    if (qrCash) qrCash.hidden = true;
    if (qrWrap) {
      qrWrap.hidden = false;
      var img = document.getElementById("shop-thanks-qr-img");
      var amount = Math.round(order.total);
      var vs = order.orderNumber.replace(/\D/g, "").slice(-10) || "123456";
      var spayd = "SPD*1.0*ACC:CZ6508000000192000145399*AM:" + amount + ".00*CC:CZK*MSG:PSOCHAZKY*X-VS:" + vs;
      if (img) {
        img.src =
          "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" + encodeURIComponent(spayd);
        img.alt = "QR kód pro platbu (náhled)";
      }
      document.getElementById("shop-thanks-vs").textContent = vs;
      document.getElementById("shop-thanks-amount").textContent = ShopCart.formatMoney(order.total);
    }
  } else {
    if (qrWrap) qrWrap.hidden = true;
    if (qrCash) qrCash.hidden = false;
  }

  document.getElementById("shop-thanks-invoice-note").textContent =
    "Faktura č. " + order.orderNumber.replace("NAHLED", "2026") + " (ukázkový náhled PDF – po spuštění obchodu přijde e-mailem).";
})();
