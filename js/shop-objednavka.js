(async function () {
  if (!window.ShopCart) return;

  var form = document.getElementById("shop-checkout-form");
  var summaryEl = document.getElementById("shop-checkout-summary");
  var emptyRedirect = document.getElementById("shop-checkout-empty");
  if (!form || !summaryEl) return;

  var settings = null;
  try {
    var settingsRes = await fetch("data/obchod-settings.json", { cache: "no-store" });
    if (settingsRes.ok) settings = await settingsRes.json();
  } catch (_) {}

  var cart = ShopCart.readCart();
  if (!cart.items.length) {
    form.hidden = true;
    if (emptyRedirect) emptyRedirect.hidden = false;
    return;
  }

  if (emptyRedirect) emptyRedirect.hidden = true;

  var shippingFieldset = document.getElementById("shop-shipping-options");
  var paymentFieldset = document.getElementById("shop-payment-options");
  var zasilkovnaWrap = document.getElementById("shop-zasilkovna-field");

  function shippingPrice(id) {
    if (!settings || !settings.shipping) return 0;
    if (id === "zasilkovna") return settings.shipping.zasilkovna.price || 0;
    return settings.shipping.pickup.price || 0;
  }

  function selectedShippingId() {
    var checked = form.querySelector('input[name="shipping"]:checked');
    return checked ? checked.value : "pickup";
  }

  function selectedPaymentId() {
    var checked = form.querySelector('input[name="payment"]:checked');
    return checked ? checked.value : "transfer";
  }

  function renderSummary() {
    var shipId = selectedShippingId();
    var shipCost = shippingPrice(shipId);
    var subtotal = ShopCart.getSubtotal();
    var total = subtotal + shipCost;

    var lines = cart.items
      .map(function (item) {
        return ShopCart.displayTitle(item) + " × " + item.quantity + " — " + ShopCart.formatMoney(item.price * item.quantity);
      })
      .join("\n");

    summaryEl.innerHTML =
      "<ul class=\"shop-checkout-lines\">" +
      cart.items
        .map(function (item) {
          return (
            "<li><span>" +
            ShopCart.displayTitle(item) +
            " × " +
            item.quantity +
            "</span><span>" +
            ShopCart.formatMoney(item.price * item.quantity) +
            "</span></li>"
          );
        })
        .join("") +
      "</ul>" +
      "<p class=\"shop-checkout-row\"><span>Mezisoučet</span><span>" +
      ShopCart.formatMoney(subtotal) +
      "</span></p>" +
      "<p class=\"shop-checkout-row\"><span>Doprava</span><span>" +
      ShopCart.formatMoney(shipCost) +
      "</span></p>" +
      "<p class=\"shop-checkout-row shop-checkout-row--total\"><span>Celkem</span><strong>" +
      ShopCart.formatMoney(total) +
      "</strong></p>";

    if (zasilkovnaWrap) {
      zasilkovnaWrap.hidden = shipId !== "zasilkovna";
    }
  }

  if (settings && shippingFieldset) {
    shippingFieldset.innerHTML = "";
    ["pickup", "zasilkovna"].forEach(function (key) {
      var opt = settings.shipping[key];
      if (!opt) return;
      var label = document.createElement("label");
      label.className = "shop-radio";
      label.innerHTML =
        '<input type="radio" name="shipping" value="' +
        opt.id +
        '" ' +
        (key === "pickup" ? "checked" : "") +
        " />" +
        "<span><strong>" +
        opt.label +
        "</strong> — " +
        ShopCart.formatMoney(opt.price) +
        (opt.hint ? '<br /><span class="shop-radio__hint">' + opt.hint + "</span>" : "") +
        "</span>";
      shippingFieldset.appendChild(label);
    });
  }

  if (settings && paymentFieldset) {
    paymentFieldset.innerHTML = "";
    ["transfer", "cash"].forEach(function (key) {
      var opt = settings.paymentMethods[key];
      if (!opt) return;
      var label = document.createElement("label");
      label.className = "shop-radio";
      label.innerHTML =
        '<input type="radio" name="payment" value="' +
        opt.id +
        '" ' +
        (key === "transfer" ? "checked" : "") +
        " />" +
        "<span>" +
        opt.label +
        "</span>";
      paymentFieldset.appendChild(label);
    });
  }

  form.addEventListener("change", renderSummary);
  renderSummary();

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var shipId = selectedShippingId();
    if (shipId === "zasilkovna" && form.zasilkovnaPoint && !form.zasilkovnaPoint.value.trim()) {
      form.zasilkovnaPoint.focus();
      form.zasilkovnaPoint.setCustomValidity("Vyplň prosím pobočku Zásilkovny.");
      form.zasilkovnaPoint.reportValidity();
      return;
    }
    if (form.zasilkovnaPoint) form.zasilkovnaPoint.setCustomValidity("");

    var shipCost = shippingPrice(shipId);
    var subtotal = ShopCart.getSubtotal();
    var total = subtotal + shipCost;
    var orderNumber = "NAHLED-" + Date.now().toString().slice(-6);

    var order = {
      preview: true,
      orderNumber: orderNumber,
      createdAt: new Date().toISOString(),
      customer: {
        name: form.customerName.value.trim(),
        email: form.customerEmail.value.trim(),
        phone: form.customerPhone.value.trim(),
        street: form.customerStreet.value.trim(),
        city: form.customerCity.value.trim(),
        zip: form.customerZip.value.trim(),
        note: form.customerNote.value.trim(),
        zasilkovnaPoint: form.zasilkovnaPoint ? form.zasilkovnaPoint.value.trim() : "",
      },
      shipping: shipId,
      payment: selectedPaymentId(),
      items: cart.items.slice(),
      subtotal: subtotal,
      shippingCost: shipCost,
      total: total,
    };

    ShopCart.savePreviewOrder(order);
    ShopCart.clearCart();
    window.location.href = "obchod-dekujeme.html";
  });
})();
