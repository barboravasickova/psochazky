(async () => {
  function formatPrice(product) {
    if (product.priceFormatted) return product.priceFormatted;
    if (typeof product.price === "number") {
      return new Intl.NumberFormat("cs-CZ", {
        style: "currency",
        currency: "CZK",
        maximumFractionDigits: 0,
      }).format(product.price);
    }
    return "";
  }

  function buildProductCard(product) {
    const article = document.createElement("article");
    article.className = "shop-product";

    if (product.image) {
      const media = document.createElement("div");
      media.className = "shop-product__media";
      const img = document.createElement("img");
      img.src = product.image;
      img.alt = product.imageAlt || product.title || "";
      img.loading = "lazy";
      img.decoding = "async";
      media.appendChild(img);
      article.appendChild(media);
    }

    const body = document.createElement("div");
    body.className = "shop-product__body";

    const title = document.createElement("h2");
    title.className = "shop-product__title";
    title.textContent = product.title || "";
    body.appendChild(title);

    if (product.description) {
      const desc = document.createElement("p");
      desc.className = "shop-product__desc";
      desc.textContent = product.description;
      body.appendChild(desc);
    }

    const price = document.createElement("p");
    price.className = "shop-product__price";
    price.textContent = formatPrice(product);
    body.appendChild(price);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn shop-product__btn";
    btn.textContent = "Přidat do košíku";
    btn.disabled = true;
    btn.title = "Košík a platby se právě připravují";
    body.appendChild(btn);

    article.appendChild(body);
    return article;
  }

  try {
    const [contentRes, productsRes] = await Promise.all([
      fetch("data/obchod-content.json", { cache: "no-store" }),
      fetch("data/obchod-products.json", { cache: "no-store" }),
    ]);

    const titleEl = document.getElementById("shop-title");
    const introEl = document.getElementById("shop-intro");
    const gridEl = document.getElementById("shop-grid");
    const emptyEl = document.getElementById("shop-empty");

    if (contentRes.ok) {
      const content = await contentRes.json();
      if (titleEl && content.title) titleEl.textContent = content.title;
      if (introEl && content.intro) introEl.textContent = content.intro;
      if (emptyEl && content.emptyMessage) emptyEl.textContent = content.emptyMessage;
    }

    if (!productsRes.ok || !gridEl || !emptyEl) return;

    const data = await productsRes.json();
    const products = (data.products || []).filter((item) => item.active !== false);

    if (!products.length) {
      emptyEl.hidden = false;
      gridEl.hidden = true;
      return;
    }

    emptyEl.hidden = true;
    gridEl.hidden = false;
    products.forEach((product) => {
      gridEl.appendChild(buildProductCard(product));
    });
  } catch (error) {
    console.error("CMS obchod load error:", error);
  }
})();
