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
  var billingSameCheckbox = form.billingSameAsDelivery;
  var billingFieldset = document.getElementById("shop-billing-address");

  function syncBillingAddressVisibility() {
    if (!billingFieldset || !billingSameCheckbox) return;
    var same = billingSameCheckbox.checked;
    billingFieldset.hidden = same;
    billingFieldset.querySelectorAll("input").forEach(function (input) {
      input.required = !same;
      if (same) input.value = "";
    });
  }

  if (billingSameCheckbox) {
    billingSameCheckbox.addEventListener("change", syncBillingAddressVisibility);
    syncBillingAddressVisibility();
  }

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

  function syncZasilkovnaBranchField() {
    var input = form.zasilkovnaPoint;
    if (!input) return;
    var active = selectedShippingId() === "zasilkovna";
    input.disabled = !active;
    input.required = active;
    if (!active) input.setCustomValidity("");
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

    syncZasilkovnaBranchField();
  }

  if (settings && shippingFieldset) {
    shippingFieldset.innerHTML = "";
    var shippingBubble = document.createElement("div");
    shippingBubble.className = "shop-option-bubble";

    ["pickup", "zasilkovna"].forEach(function (key) {
      var opt = settings.shipping[key];
      if (!opt) return;

      if (key === "zasilkovna") {
        var zSection = document.createElement("div");
        zSection.className = "shop-option-bubble__section";

        var radioLabel = document.createElement("label");
        radioLabel.className = "shop-radio shop-radio--in-group";
        radioLabel.innerHTML =
          '<input type="radio" name="shipping" value="' +
          opt.id +
          '" />' +
          "<span><strong>" +
          opt.label +
          "</strong> — " +
          ShopCart.formatMoney(opt.price) +
          (opt.hint ? '<br /><span class="shop-radio__hint">' + opt.hint + "</span>" : "") +
          "</span>";
        zSection.appendChild(radioLabel);

        var branchWrap = document.createElement("div");
        branchWrap.className = "shop-zasilkovna-branch";

        var branchInput = document.createElement("input");
        branchInput.type = "text";
        branchInput.name = "zasilkovnaPoint";
        branchInput.placeholder = "Např. Brno – Veveří, …";
        branchInput.disabled = true;

        var branchLabel = document.createElement("label");
        branchLabel.className = "shop-field shop-field--nested";
        branchLabel.appendChild(document.createTextNode("Pobočka Zásilkovny (název a adresa) *"));
        branchLabel.appendChild(branchInput);
        branchWrap.appendChild(branchLabel);
        zSection.appendChild(branchWrap);
        shippingBubble.appendChild(zSection);
        return;
      }

      var label = document.createElement("label");
      label.className = "shop-radio shop-radio--in-group";
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
      shippingBubble.appendChild(label);
    });

    shippingFieldset.appendChild(shippingBubble);
    syncZasilkovnaBranchField();
  }

  if (settings && paymentFieldset) {
    paymentFieldset.innerHTML = "";
    var paymentBubble = document.createElement("div");
    paymentBubble.className = "shop-option-bubble";

    ["transfer", "cash"].forEach(function (key) {
      var opt = settings.paymentMethods[key];
      if (!opt) return;
      var label = document.createElement("label");
      label.className = "shop-radio shop-radio--in-group";
      label.innerHTML =
        '<input type="radio" name="payment" value="' +
        opt.id +
        '" ' +
        (key === "transfer" ? "checked" : "") +
        " />" +
        "<span>" +
        opt.label +
        "</span>";
      paymentBubble.appendChild(label);
    });

    paymentFieldset.appendChild(paymentBubble);
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
    var variableSymbol = orderNumber.replace(/\D/g, "").slice(-10) || String(Date.now()).slice(-6);

    var deliveryStreet = form.customerStreet.value.trim();
    var deliveryCity = form.customerCity.value.trim();
    var deliveryZip = form.customerZip.value.trim();
    var billingSame = billingSameCheckbox ? billingSameCheckbox.checked : true;
    var billingStreet = billingSame
      ? deliveryStreet
      : form.billingStreet ? form.billingStreet.value.trim() : "";
    var billingCity = billingSame
      ? deliveryCity
      : form.billingCity ? form.billingCity.value.trim() : "";
    var billingZip = billingSame
      ? deliveryZip
      : form.billingZip ? form.billingZip.value.trim() : "";

    if (!billingSame && billingFieldset) {
      var billingInputs = billingFieldset.querySelectorAll("input[required]");
      for (var i = 0; i < billingInputs.length; i++) {
        if (!billingInputs[i].value.trim()) {
          billingInputs[i].reportValidity();
          return;
        }
      }
    }

    var order = {
      preview: true,
      orderNumber: orderNumber,
      createdAt: new Date().toISOString(),
      customer: {
        name: form.customerName.value.trim(),
        email: form.customerEmail.value.trim(),
        phone: form.customerPhone.value.trim(),
        street: deliveryStreet,
        city: deliveryCity,
        zip: deliveryZip,
        billingSameAsDelivery: billingSame,
        billingStreet: billingStreet,
        billingCity: billingCity,
        billingZip: billingZip,
        note: form.customerNote.value.trim(),
        zasilkovnaPoint: form.zasilkovnaPoint ? form.zasilkovnaPoint.value.trim() : "",
      },
      shipping: shipId,
      payment: selectedPaymentId(),
      variableSymbol: variableSymbol,
      webinvoiceUrl: null,
      fakturoidInvoiceId: null,
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
