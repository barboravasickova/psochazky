(function () {
  if (!window.ShopCart) return;

  var emptyEl = document.getElementById("shop-thanks-empty");
  var contentEl = document.getElementById("shop-thanks-content");

  function renderOrder(order, settings) {
    if (emptyEl) emptyEl.hidden = true;
    if (contentEl) contentEl.hidden = false;

    document.getElementById("shop-thanks-order-number").textContent = order.orderNumber;
    document.getElementById("shop-thanks-total").textContent = ShopCart.formatMoney(order.total);

    var emailEl = document.getElementById("shop-thanks-customer-email");
    if (emailEl && order.customer && order.customer.email) {
      emailEl.textContent = order.customer.email;
    }

    var itemsEl = document.getElementById("shop-thanks-items");
    if (itemsEl) {
      itemsEl.innerHTML = order.items
        .map(function (item) {
          return "<li>" + ShopCart.displayTitle(item) + " ├Ś " + item.quantity + "</li>";
        })
        .join("");
    }

    var transferEl = document.getElementById("shop-thanks-transfer");
    var cashEl = document.getElementById("shop-thanks-cash");
    var invoiceNoteEl = document.getElementById("shop-thanks-invoice-note");

    if (order.payment === "transfer") {
      if (cashEl) cashEl.hidden = true;
      if (transferEl) transferEl.hidden = false;

      var vs =
        order.variableSymbol ||
        (order.orderNumber ? order.orderNumber.replace(/\D/g, "").slice(-10) : "") ||
        "123456";

      var amountEl = document.getElementById("shop-thanks-amount");
      var vsEl = document.getElementById("shop-thanks-vs");
      if (amountEl) amountEl.textContent = ShopCart.formatMoney(order.total);
      if (vsEl) vsEl.textContent = vs;

      var iban =
        (settings && settings.bankTransfer && settings.bankTransfer.iban) ||
        "CZ6508000000192000145399";
      var msg =
        (settings && settings.bankTransfer && settings.bankTransfer.paymentMessage) ||
        "PSOCHAZKY";
      var amount = Math.round(order.total);
      var spayd =
        "SPD*1.0*ACC:" +
        iban +
        "*AM:" +
        amount +
        ".00*CC:CZK*MSG:" +
        msg +
        "*X-VS:" +
        vs;

      var img = document.getElementById("shop-thanks-qr-img");
      if (img) {
        img.src =
          "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=" +
          encodeURIComponent(spayd);
        img.alt = "QR k├│d pro platbu p┼Öevodem";
      }

      var webinvoiceBtn = document.getElementById("shop-thanks-webinvoice");
      var webinvoicePreview = document.getElementById("shop-thanks-webinvoice-preview");
      var webinvoiceUrl = order.webinvoiceUrl || "";

      if (webinvoiceBtn) {
        if (webinvoiceUrl) {
          webinvoiceBtn.href = webinvoiceUrl;
          webinvoiceBtn.hidden = false;
          if (webinvoicePreview) webinvoicePreview.hidden = true;
        } else {
          webinvoiceBtn.removeAttribute("href");
          webinvoiceBtn.hidden = true;
          if (webinvoicePreview) {
            webinvoicePreview.hidden = false;
            webinvoicePreview.textContent = order.preview
              ? "Po napojen├ş Fakturoidu zde bude tla─Ź├ştko na webfakturu (faktura v prohl├ş┼że─Źi v─Źetn─Ť QR). Do e-mailu z├íkazn├şkovi p┼»jde stejn├Ż odkaz."
              : "Odkaz na fakturu se p┼Öipravuje. Zkontrolujte e-mail nebo n├ís kontaktujte.";
          }
        }
      }

      if (invoiceNoteEl) {
        invoiceNoteEl.textContent =
          "Platbu m┼»┼żete prov├ęst QR k├│dem n├ş┼że. Stejn├ę ├║daje budou na faktu┼Öe ve Fakturoidu ÔÇö po odesl├ín├ş objedn├ívky v├ím p┼Öijde e-mail s odkazem.";
      }
    } else {
      if (transferEl) transferEl.hidden = true;
      if (cashEl) cashEl.hidden = false;
      if (invoiceNoteEl) {
        invoiceNoteEl.textContent = "Objedn├ívku jsme zaznamenali. Platbu domluv├şme p┼Öi p┼Öevzet├ş.";
      }
    }
  }

  var order = ShopCart.loadPreviewOrder();
  var params = new URLSearchParams(window.location.search);
  var orderNumber = params.get("orderNumber");
  var variableSymbol = params.get("variableSymbol");

  if (orderNumber) {
    if (!order) {
      order = {
        items: [],
        total: 0,
        customer: { email: "" },
        payment: "transfer",
      };
    }
    order.orderNumber = orderNumber;
    order.preview = false;
    if (variableSymbol) order.variableSymbol = variableSymbol;
  } else if (order) {
    order.preview = !!order.preview;
  }

  if (!order || !order.orderNumber) {
    if (emptyEl) emptyEl.hidden = false;
    if (contentEl) contentEl.hidden = true;
    return;
  }

  fetch("data/obchod-settings.json", { cache: "no-store" })
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .catch(function () {
      return null;
    })
    .then(function (settings) {
      renderOrder(order, settings);
      ShopCart.clearCart();
      ShopCart.clearPreviewOrder();
    });
})();
