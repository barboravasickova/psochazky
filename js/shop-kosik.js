(async function () {
  if (!window.ShopCart) return;

  var cartList = document.getElementById("shop-cart-list");
  var emptyEl = document.getElementById("shop-cart-empty");
  var summaryEl = document.getElementById("shop-cart-summary");
  var checkoutBtn = document.getElementById("shop-cart-checkout");
  if (!cartList || !emptyEl) return;

  var settings = { shipping: { pickup: { price: 0 }, zasilkovna: { price: 89 } } };
  try {
    var settingsRes = await fetch("data/obchod-settings.json", { cache: "no-store" });
    if (settingsRes.ok) settings = await settingsRes.json();
  } catch (_) {}

  function render() {
    var cart = ShopCart.readCart();
    cartList.innerHTML = "";

    if (!cart.items.length) {
      emptyEl.hidden = false;
      summaryEl.hidden = true;
      if (checkoutBtn) checkoutBtn.hidden = true;
      return;
    }

    emptyEl.hidden = true;
    summaryEl.hidden = false;
    if (checkoutBtn) checkoutBtn.hidden = false;

    cart.items.forEach(function (item) {
      var row = document.createElement("div");
      row.className = "shop-cart-item";

      if (item.image) {
        row.classList.add("shop-cart-item--with-media");
        var media = document.createElement("div");
        media.className = "shop-cart-item__media";
        var img = document.createElement("img");
        img.src = item.image;
        img.alt = "";
        img.loading = "lazy";
        media.appendChild(img);
        row.appendChild(media);
      }

      var body = document.createElement("div");
      body.className = "shop-cart-item__body";

      var title = document.createElement("h2");
      title.className = "shop-cart-item__title";
      title.textContent = ShopCart.displayTitle(item);
      body.appendChild(title);

      var variant = ShopCart.formatVariantLabel(item);
      if (variant) {
        var variantEl = document.createElement("p");
        variantEl.className = "shop-cart-item__variant";
        variantEl.textContent = variant;
        body.appendChild(variantEl);
      }

      var linePrice = document.createElement("p");
      linePrice.className = "shop-cart-item__line";
      linePrice.textContent =
        ShopCart.formatMoney(item.price) + " × " + item.quantity + " = " + ShopCart.formatMoney(item.price * item.quantity);
      body.appendChild(linePrice);

      var controls = document.createElement("div");
      controls.className = "shop-cart-item__controls";

      var minus = document.createElement("button");
      minus.type = "button";
      minus.className = "shop-cart-qty-btn";
      minus.textContent = "−";
      minus.addEventListener("click", function () {
        ShopCart.setQuantity(item.lineId, item.quantity - 1);
        render();
      });

      var qty = document.createElement("span");
      qty.className = "shop-cart-item__qty";
      qty.textContent = String(item.quantity);

      var plus = document.createElement("button");
      plus.type = "button";
      plus.className = "shop-cart-qty-btn";
      plus.textContent = "+";
      plus.addEventListener("click", function () {
        ShopCart.setQuantity(item.lineId, item.quantity + 1);
        render();
      });

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "shop-cart-remove";
      remove.textContent = "Odebrat";
      remove.addEventListener("click", function () {
        ShopCart.removeItem(item.lineId);
        render();
      });

      controls.appendChild(minus);
      controls.appendChild(qty);
      controls.appendChild(plus);
      controls.appendChild(remove);
      body.appendChild(controls);
      row.appendChild(body);
      cartList.appendChild(row);
    });

    var subtotal = ShopCart.getSubtotal();
    var pickupPrice = settings.shipping.pickup.price || 0;
    var zasilkovnaPrice = settings.shipping.zasilkovna.price || 0;

    document.getElementById("shop-cart-subtotal").textContent = ShopCart.formatMoney(subtotal);
    document.getElementById("shop-cart-shipping-note").textContent =
      "Doprava se dopočítá v objednávce (osobní odběr " +
      ShopCart.formatMoney(pickupPrice) +
      ", Zásilkovna " +
      ShopCart.formatMoney(zasilkovnaPrice) +
      " za celou objednávku).";
  }

  render();
})();
