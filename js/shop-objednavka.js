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
  var packetaConfig = (settings && settings.packeta) || {};
  var packetaApiKey = packetaConfig.widgetApiKey || "";
  var selectedPacketaBranch = null;
  var packetaPickerEl = null;
  var orderLoadingEl = document.getElementById("shop-order-loading");

  function setOrderSubmitLoading(isLoading) {
    if (orderLoadingEl) {
      orderLoadingEl.hidden = !isLoading;
      orderLoadingEl.setAttribute("aria-hidden", isLoading ? "false" : "true");
    }
    document.body.classList.toggle("shop-order-submitting", isLoading);
  }

  function redirectOrderToSheet(webAppUrl, order) {
    var thanksUrl = new URL("obchod-dekujeme.html", window.location.href).href;
    var errorUrl = new URL("obchod-objednavka.html", window.location.href).href;
    var encoded = encodeURIComponent(JSON.stringify(order));
    if (encoded.length >= 7500) {
      throw new Error(
        "Objednávka je příliš rozsáhlá. Kontaktujte nás prosím na psochazky@gmail.com."
      );
    }
    ShopCart.savePreviewOrder(order);
    window.location.href =
      webAppUrl +
      (webAppUrl.indexOf("?") >= 0 ? "&" : "?") +
      "data=" +
      encoded +
      "&returnUrl=" +
      encodeURIComponent(thanksUrl) +
      "&errorUrl=" +
      encodeURIComponent(errorUrl);
  }

  var checkoutParams = new URLSearchParams(window.location.search);
  var checkoutOrderError = checkoutParams.get("orderError");
  if (checkoutOrderError) {
    window.alert(
      "Objednávku se nepodařilo uložit do tabulky. Zkuste to prosím znovu, nebo nás kontaktujte na psochazky@gmail.com.\n\nTechnická chyba: " +
        checkoutOrderError
    );
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

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

  function syncPacketaPickerState() {
    if (!packetaPickerEl) return;
    var active = selectedShippingId() === "zasilkovna";
    packetaPickerEl.classList.toggle("is-inactive", !active);
    if (!active) {
      clearPacketaBranch(false);
    }
  }

  function clearPacketaBranch(showEmptyState) {
    selectedPacketaBranch = null;
    if (!packetaPickerEl) return;
    var idInput = packetaPickerEl.querySelector('[name="packetaBranchId"]');
    var addressInput = packetaPickerEl.querySelector(".shop-packeta-picker__address");
    var errorEl = packetaPickerEl.querySelector(".shop-packeta-picker__error");
    if (idInput) idInput.value = "";
    if (addressInput) {
      addressInput.value = "";
      addressInput.placeholder =
        showEmptyState === false ? "" : "Po výběru se zde zobrazí adresa výdejny";
    }
    if (errorEl) errorEl.hidden = true;
  }

  function setPacketaBranch(branch) {
    selectedPacketaBranch = branch;
    if (!packetaPickerEl || !branch) return;
    var idInput = packetaPickerEl.querySelector('[name="packetaBranchId"]');
    var addressInput = packetaPickerEl.querySelector(".shop-packeta-picker__address");
    var errorEl = packetaPickerEl.querySelector(".shop-packeta-picker__error");
    if (idInput) idInput.value = branch.id;
    if (addressInput) {
      addressInput.value = branch.label;
      addressInput.placeholder = "";
    }
    if (errorEl) errorEl.hidden = true;
  }

  function showPacketaPickerError(message) {
    if (!packetaPickerEl) return;
    var errorEl = packetaPickerEl.querySelector(".shop-packeta-picker__error");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
  }

  function ensureZasilkovnaSelected() {
    if (selectedShippingId() === "zasilkovna") return;
    var radio = form.querySelector('input[name="shipping"][value="zasilkovna"]');
    if (radio) {
      radio.checked = true;
      renderSummary();
    }
  }

  function openPacketaWidget() {
    ensureZasilkovnaSelected();

    if (!packetaApiKey) {
      showPacketaPickerError("Výběr výdejny není nakonfigurovaný. Napište nám prosím pobočku do poznámky.");
      return;
    }
    if (!window.ShopPacketa || !ShopPacketa.isReady()) {
      showPacketaPickerError("Mapa Zásilkovny se nepodařila načíst. Obnovte stránku a zkuste to znovu.");
      return;
    }

    var widgetOptions = {
      country: packetaConfig.country || "cz",
      language: packetaConfig.language || "cs",
    };
    if (
      typeof packetaConfig.latitude === "number" &&
      typeof packetaConfig.longitude === "number"
    ) {
      widgetOptions.latitude = packetaConfig.latitude;
      widgetOptions.longitude = packetaConfig.longitude;
    }

    ShopPacketa.openPicker(
      packetaApiKey,
      widgetOptions,
      function (branch, error) {
        if (error) {
          if (error.message === "branch-unavailable") {
            showPacketaPickerError("Tato pobočka teď není dostupná. Vyberte prosím jinou.");
          }
          return;
        }
        if (branch) setPacketaBranch(branch);
      }
    );
  }

  function buildPacketaPicker() {
    var wrap = document.createElement("div");
    wrap.className = "shop-packeta-picker is-inactive";

    var pickBtn = document.createElement("button");
    pickBtn.type = "button";
    pickBtn.className = "shop-packeta-picker__open";
    pickBtn.textContent = "Vybrat výdejnu";
    pickBtn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      openPacketaWidget();
    });
    wrap.appendChild(pickBtn);

    var addressInput = document.createElement("input");
    addressInput.type = "text";
    addressInput.className = "shop-packeta-picker__address";
    addressInput.name = "zasilkovnaPoint";
    addressInput.readOnly = true;
    addressInput.placeholder = "Po výběru se zde zobrazí adresa výdejny";
    addressInput.setAttribute("aria-live", "polite");
    addressInput.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      openPacketaWidget();
    });
    addressInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPacketaWidget();
      }
    });
    wrap.appendChild(addressInput);

    var idInput = document.createElement("input");
    idInput.type = "hidden";
    idInput.name = "packetaBranchId";
    wrap.appendChild(idInput);

    var error = document.createElement("p");
    error.className = "shop-packeta-picker__error";
    error.hidden = true;
    error.setAttribute("role", "alert");
    wrap.appendChild(error);

    return wrap;
  }

  function syncZasilkovnaBranchField() {
    syncPacketaPickerState();
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
        packetaPickerEl = buildPacketaPicker();
        branchWrap.appendChild(packetaPickerEl);
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
    if (shipId === "zasilkovna") {
      if (!selectedPacketaBranch || !selectedPacketaBranch.id) {
        showPacketaPickerError("Vyber prosím výdejnu Zásilkovny.");
        if (packetaPickerEl) {
          var pickBtn = packetaPickerEl.querySelector(".shop-packeta-picker__open");
          if (pickBtn) pickBtn.focus();
          packetaPickerEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
    }

    var shipCost = shippingPrice(shipId);
    var subtotal = ShopCart.getSubtotal();
    var total = subtotal + shipCost;

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
      preview: !!(settings && settings.previewMode),
      orderNumber: "",
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
        zasilkovnaPoint: selectedPacketaBranch ? selectedPacketaBranch.label : "",
        packetaBranch: selectedPacketaBranch ? Object.assign({}, selectedPacketaBranch) : null,
      },
      shipping: shipId,
      payment: selectedPaymentId(),
      variableSymbol: "",
      items: cart.items.slice(),
      subtotal: subtotal,
      shippingCost: shipCost,
      total: total,
    };

    var submitBtn = form.querySelector('button[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Odesílám…";
    }
    setOrderSubmitLoading(true);

    var webAppUrl = settings && settings.orders && settings.orders.webAppUrl;
    if (webAppUrl) {
      try {
        setOrderSubmitLoading(true);
        redirectOrderToSheet(webAppUrl, order);
        return;
      } catch (redirectError) {
        console.error("Order redirect error:", redirectError);
        setOrderSubmitLoading(false);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitLabel || "Odeslat objednávku";
        }
        window.alert(
          "Objednávku se nepodařilo odeslat. Zkuste to prosím znovu, nebo nás kontaktujte na psochazky@gmail.com.\n\nTechnická chyba: " +
            (redirectError && redirectError.message ? redirectError.message : redirectError)
        );
        return;
      }
    } else {
      order.orderNumber = "NAHLED-" + Date.now().toString().slice(-6);
      order.variableSymbol =
        order.orderNumber.replace(/\D/g, "").slice(-10) ||
        String(Date.now()).slice(-6);
    }

    ShopCart.savePreviewOrder(order);
    ShopCart.clearCart();
    window.location.href = "obchod-dekujeme.html";
  });
})();
