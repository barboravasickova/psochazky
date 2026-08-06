(function () {
  var STORAGE_KEY = "psochazky-shop-cart-v2";
  var ORDER_PREVIEW_KEY = "psochazky-shop-preview-order-v1";

  function makeLineId(id, color, size) {
    return id + "::" + (color || "-") + "::" + (size || "-");
  }

  function normalizeItem(item) {
    if (!item.lineId) {
      item.lineId = makeLineId(item.id, item.color, item.size);
    }
    return item;
  }

  function readCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { items: [] };
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.items)) return { items: [] };
      data.items = data.items.map(normalizeItem);
      return data;
    } catch (_) {
      return { items: [] };
    }
  }

  function writeCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
  }

  function formatMoney(amount) {
    return new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatVariantLabel(item) {
    var parts = [];
    if (item.color) parts.push("Barva: " + item.color);
    if (item.size) parts.push("Velikost: " + item.size);
    return parts.length ? parts.join(", ") : "";
  }

  function displayTitle(item) {
    var variant = formatVariantLabel(item);
    return variant ? item.title + " (" + variant + ")" : item.title;
  }

  function getItemCount() {
    return readCart().items.reduce(function (sum, item) {
      return sum + (item.quantity || 0);
    }, 0);
  }

  function getSubtotal() {
    return readCart().items.reduce(function (sum, item) {
      return sum + item.price * item.quantity;
    }, 0);
  }

  function addItem(product, quantity, options) {
    var qty = quantity || 1;
    var color = options && options.color ? options.color : "";
    var size = options && options.size ? options.size : "";
    var lineId = makeLineId(product.id, color, size);
    var cart = readCart();
    var existing = cart.items.find(function (item) {
      return item.lineId === lineId;
    });

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.items.push({
        lineId: lineId,
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image || "",
        color: color,
        size: size,
        quantity: qty,
      });
    }

    writeCart(cart);
    return cart;
  }

  function setQuantity(lineId, quantity) {
    var cart = readCart();
    var item = cart.items.find(function (entry) {
      return entry.lineId === lineId;
    });
    if (!item) return cart;

    if (quantity <= 0) {
      cart.items = cart.items.filter(function (entry) {
        return entry.lineId !== lineId;
      });
    } else {
      item.quantity = quantity;
    }

    writeCart(cart);
    return cart;
  }

  function removeItem(lineId) {
    return setQuantity(lineId, 0);
  }

  function clearCart() {
    writeCart({ items: [] });
  }

  function updateCartBadge() {
    var count = getItemCount();
    document.querySelectorAll("[data-shop-cart-count]").forEach(function (el) {
      el.textContent = String(count);
    });
    document.querySelectorAll("[data-shop-cart-link]").forEach(function (el) {
      el.hidden = false;
    });
  }

  function savePreviewOrder(order) {
    sessionStorage.setItem(ORDER_PREVIEW_KEY, JSON.stringify(order));
  }

  function loadPreviewOrder() {
    try {
      var raw = sessionStorage.getItem(ORDER_PREVIEW_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function clearPreviewOrder() {
    sessionStorage.removeItem(ORDER_PREVIEW_KEY);
  }

  window.ShopCart = {
    STORAGE_KEY: STORAGE_KEY,
    makeLineId: makeLineId,
    readCart: readCart,
    addItem: addItem,
    setQuantity: setQuantity,
    removeItem: removeItem,
    clearCart: clearCart,
    getItemCount: getItemCount,
    getSubtotal: getSubtotal,
    formatMoney: formatMoney,
    formatVariantLabel: formatVariantLabel,
    displayTitle: displayTitle,
    savePreviewOrder: savePreviewOrder,
    loadPreviewOrder: loadPreviewOrder,
    clearPreviewOrder: clearPreviewOrder,
    updateCartBadge: updateCartBadge,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateCartBadge);
  } else {
    updateCartBadge();
  }
})();
