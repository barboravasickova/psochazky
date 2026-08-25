(async () => {
  function normalizeImagePath(src) {
    if (typeof src !== "string" || !src) return "";
    const trimmed = src.trim();
    if (trimmed.startsWith("/")) return trimmed.slice(1);
    return trimmed;
  }

  function normalizeSizeList(sizes) {
    if (!Array.isArray(sizes)) return [];
    return sizes
      .map((entry) => {
        if (typeof entry === "string") return entry.trim();
        if (entry && typeof entry.size === "string") return entry.size.trim();
        return "";
      })
      .filter(Boolean);
  }

  function normalizeProduct(product) {
    if (!product || typeof product !== "object") return product;
    const normalized = { ...product };
    if (normalized.image) {
      normalized.image = normalizeImagePath(normalized.image);
    }
    if (normalized.badge === "") {
      delete normalized.badge;
    }
    if (normalized.variants && typeof normalized.variants === "object") {
      const variants = { ...normalized.variants };
      if (variants.sizes) {
        variants.sizes = normalizeSizeList(variants.sizes);
      }
      if (Array.isArray(variants.colors)) {
        variants.colors = variants.colors.map((color) => ({
          ...color,
          image: normalizeImagePath(color.image),
        }));
      }
      normalized.variants = variants;
    }
    return normalized;
  }

  function formatPrice(product) {
    if (window.ShopCart) return ShopCart.formatMoney(product.price);
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

  function normalizeColorOptions(variants) {
    const colors = variants && variants.colors;
    if (!Array.isArray(colors)) return [];
    return colors
      .map((entry) => {
        if (typeof entry === "string") {
          return { label: entry, image: "", swatch: "" };
        }
        return {
          label: entry.label || entry.id || "",
          image: entry.image || "",
          swatch: entry.swatch || "",
        };
      })
      .filter((entry) => entry.label);
  }

  function productImages(product) {
    if (Array.isArray(product.images) && product.images.length) {
      return product.images.filter(Boolean);
    }
    const colorImages = normalizeColorOptions(product.variants || {})
      .map((c) => c.image)
      .filter(Boolean);
    if (colorImages.length) {
      const ordered = product.image
        ? [product.image, ...colorImages.filter((src) => src !== product.image)]
        : [...new Set(colorImages)];
      return ordered;
    }
    if (product.image) return [product.image];
    return [];
  }

  function buildSelect(labelText, options, placeholder) {
    const wrap = document.createElement("label");
    wrap.className = "shop-product__option";

    const labelSpan = document.createElement("span");
    labelSpan.className = "shop-product__option-label";
    labelSpan.textContent = labelText;
    wrap.appendChild(labelSpan);

    const select = document.createElement("select");
    select.className = "shop-product__select";
    select.required = true;

    const placeholderOpt = document.createElement("option");
    placeholderOpt.value = "";
    placeholderOpt.textContent = placeholder;
    placeholderOpt.disabled = true;
    placeholderOpt.selected = true;
    select.appendChild(placeholderOpt);

    options.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = opt;
      select.appendChild(option);
    });

    wrap.appendChild(select);
    return { wrap, select };
  }

  function defaultSwatchColor(label) {
    const key = (label || "").toLowerCase();
    if (key.includes("bord")) return "#7a3044";
    if (key.includes("zelen")) return "#4d7a5a";
    if (key.includes("─Źern") || key.includes("cern")) return "#222222";
    return "#888888";
  }

  function findColorOption(colorOptions, label) {
    if (!label) return null;
    const target = String(label).trim().normalize("NFC").toLowerCase();
    return (
      colorOptions.find(
        (color) =>
          String(color.label || "")
            .trim()
            .normalize("NFC")
            .toLowerCase() === target
      ) || null
    );
  }

  function buildColorSwatches(colorOptions, onPick, options) {
    options = options || {};
    const showLabel = options.showLabel !== false;
    const autoSelectFirst = options.autoSelectFirst !== false;

    const wrap = document.createElement("div");
    wrap.className = "shop-product__option shop-product__option--colors";

    const labelSpan = document.createElement("span");
    labelSpan.className = "shop-product__option-label";
    labelSpan.textContent = "Barva";
    wrap.appendChild(labelSpan);

    const group = document.createElement("div");
    group.className = "shop-color-swatches";
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", "Barva produktu");

    const nameEl = document.createElement("span");
    nameEl.className = "shop-color-swatches__name";
    nameEl.textContent = "Vyber barvu";

    let selected = "";
    const buttons = new Map();

    function selectColor(color) {
      if (!color) return;
      selected = color.label;
      if (showLabel) nameEl.textContent = color.label;
      buttons.forEach((btn, label) => {
        const active = label === color.label;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-checked", active ? "true" : "false");
      });
      if (onPick) onPick(color);
    }

    colorOptions.forEach((color) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shop-color-swatch";
      btn.setAttribute("role", "radio");
      btn.setAttribute("aria-label", color.label);
      btn.setAttribute("aria-checked", "false");
      btn.title = color.label;
      const swatch = color.swatch || defaultSwatchColor(color.label);
      btn.style.setProperty("--shop-swatch-color", swatch);

      btn.addEventListener("click", () => selectColor(color));

      buttons.set(color.label, btn);
      group.appendChild(btn);
    });

    const initialColor = options.initialColor
      ? findColorOption(colorOptions, options.initialColor)
      : null;

    if (initialColor) {
      selectColor(initialColor);
    } else if (colorOptions.length && autoSelectFirst) {
      selectColor(colorOptions[0]);
    }

    wrap.appendChild(group);
    if (showLabel) wrap.appendChild(nameEl);

    return {
      wrap,
      getValue: () => selected,
      selectColor,
      focus: () => {
        const active = group.querySelector(".shop-color-swatch.is-active");
        const first = group.querySelector(".shop-color-swatch");
        (active || first).focus();
      },
    };
  }

  function buildCatalogColorSwatches(colorOptions, product, previewImg, defaultPreviewSrc, onColorOpen) {
    const wrap = document.createElement("div");
    wrap.className = "shop-catalog-tile__swatches";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Barvy produktu");

    const label = document.createElement("span");
    label.className = "shop-catalog-tile__swatches-label";
    label.textContent = "V├şce barevn├Żch variant";
    wrap.appendChild(label);

    const group = document.createElement("div");
    group.className = "shop-color-swatches shop-color-swatches--catalog";

    colorOptions.forEach((color) => {
      const btn = document.createElement("a");
      btn.className = "shop-color-swatch shop-color-swatch--catalog";
      btn.href = buildProductUrl(product.id, color.label);
      btn.setAttribute("aria-label", color.label);
      btn.title = color.label;
      btn.style.setProperty("--shop-swatch-color", color.swatch || defaultSwatchColor(color.label));

      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        onColorOpen(product.id, color.label);
      });

      btn.addEventListener("mouseenter", () => {
        if (color.image && previewImg) previewImg.src = color.image;
      });

      btn.addEventListener("mouseleave", () => {
        if (previewImg && defaultPreviewSrc) previewImg.src = defaultPreviewSrc;
      });

      group.appendChild(btn);
    });

    wrap.addEventListener("click", (event) => event.stopPropagation());
    wrap.appendChild(group);
    return wrap;
  }

  function productBadgeText(product) {
    const badge = product && product.badge;
    if (typeof badge !== "string") return "";
    const text = badge.trim();
    return text;
  }

  function productBadgeModifier(text) {
    const key = (text || "").toUpperCase();
    if (key === "P┼śEDOBJEDN├üVKA" || key === "PREDOBJEDNAVKA") {
      return "shop-product-badge--preorder";
    }
    if (key === "SKLADEM") {
      return "shop-product-badge--instock";
    }
    return "";
  }

  function appendProductBadge(container, product) {
    const text = productBadgeText(product);
    if (!text || !container) return false;
    const badge = document.createElement("span");
    const modifier = productBadgeModifier(text);
    badge.className = modifier
      ? `shop-product-badge ${modifier}`
      : "shop-product-badge";
    badge.textContent = text;
    container.appendChild(badge);
    return true;
  }

  function buildProductBadgeBar(product, barClass) {
    const text = productBadgeText(product);
    if (!text) return null;
    const bar = document.createElement("div");
    bar.className = barClass;
    appendProductBadge(bar, product);
    return bar;
  }

  function buildSizeChartPanel(sizeChart) {
    const panel = document.createElement("div");
    panel.className = "shop-size-chart";
    panel.hidden = true;

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    (sizeChart.headers || []).forEach((h) => {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = h;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    (sizeChart.rows || []).forEach((row) => {
      const tr = document.createElement("tr");
      row.forEach((cell) => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    panel.appendChild(table);
    return panel;
  }

  function buildProductUrl(id, colorLabel) {
    const url = new URL(window.location.href);
    url.searchParams.set("produkt", id);
    url.searchParams.delete("kategorie");
    if (colorLabel) {
      url.searchParams.set("barva", colorLabel);
    } else {
      url.searchParams.delete("barva");
    }
    const search = url.searchParams.toString();
    return search ? `${url.pathname}?${search}` : url.pathname;
  }

  function initialColorImage(product, colorLabel) {
    const color = findColorOption(normalizeColorOptions(product.variants || {}), colorLabel);
    return color && color.image ? color.image : "";
  }

  function buildCatalogTile(product, onOpen) {
    const article = document.createElement("article");
    article.className = "shop-catalog-tile";
    article.dataset.category = product.category || "";

    const badgeBar = document.createElement("div");
    badgeBar.className = "shop-catalog-tile__badge-bar";
    appendProductBadge(badgeBar, product);
    article.appendChild(badgeBar);

    const colorOptions = normalizeColorOptions(product.variants || {});
    const previewSrc =
      product.image || initialColorImage(product, colorOptions[0] && colorOptions[0].label) || productImages(product)[0];
    let previewImg = null;

    if (previewSrc) {
      const media = document.createElement("div");
      media.className = "shop-catalog-tile__media";

      previewImg = document.createElement("img");
      previewImg.src = previewSrc;
      previewImg.alt = product.imageAlt || product.title || "";
      previewImg.loading = "lazy";
      previewImg.decoding = "async";
      media.appendChild(previewImg);
      article.appendChild(media);
    }

    const body = document.createElement("div");
    body.className = "shop-catalog-tile__body";

    const title = document.createElement("h2");
    title.className = "shop-catalog-tile__title";
    title.textContent = product.title || "";
    body.appendChild(title);

    const desc = document.createElement("p");
    desc.className = "shop-catalog-tile__desc";
    desc.textContent = product.description || "";
    body.appendChild(desc);

    const swatchesSlot = document.createElement("div");
    swatchesSlot.className = "shop-catalog-tile__swatches-slot";
    if (colorOptions.length > 1) {
      swatchesSlot.appendChild(
        buildCatalogColorSwatches(
          colorOptions,
          product,
          previewImg,
          previewSrc,
          (productId, colorLabel) => onOpen(productId, true, colorLabel)
        )
      );
    }
    body.appendChild(swatchesSlot);

    const price = document.createElement("p");
    price.className = "shop-catalog-tile__price";
    price.textContent = formatPrice(product);
    body.appendChild(price);

    const detailLabel = document.createElement("span");
    detailLabel.className = "btn shop-catalog-tile__detail-btn";
    detailLabel.textContent = "Detail produktu";
    body.appendChild(detailLabel);

    article.appendChild(body);

    article.classList.add("shop-catalog-tile--clickable");
    article.tabIndex = 0;
    article.setAttribute("role", "link");
    article.setAttribute(
      "aria-label",
      `Detail produktu ${product.title || ""}`.trim()
    );

    function openDetail(colorLabel) {
      onOpen(product.id, true, colorLabel);
    }

    article.addEventListener("click", () => openDetail());
    article.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetail();
      }
    });

    return article;
  }

  function buildProductGallery(product, initialColor) {
    const gallery = document.createElement("div");
    gallery.className = "shop-product-detail__gallery";

    const images = productImages(product);
    if (!images.length) return gallery;

    const initialImage = initialColorImage(product, initialColor) || images[0];
    const initialIndex = Math.max(0, images.indexOf(initialImage));

    const mainWrap = document.createElement("div");
    mainWrap.className = "shop-product-detail__main";

    const mainImg = document.createElement("img");
    mainImg.className = "shop-product-detail__main-img";
    mainImg.src = initialImage;
    mainImg.alt = product.imageAlt || product.title || "";
    mainImg.decoding = "async";
    mainWrap.appendChild(mainImg);
    gallery.appendChild(mainWrap);

    if (images.length > 1) {
      const thumbs = document.createElement("div");
      thumbs.className = "shop-product-detail__thumbs";
      thumbs.setAttribute("role", "tablist");
      thumbs.setAttribute("aria-label", "Dal┼í├ş fotografie produktu");

      images.forEach((src, index) => {
        const thumbBtn = document.createElement("button");
        thumbBtn.type = "button";
        thumbBtn.className = "shop-product-detail__thumb";
        thumbBtn.setAttribute("role", "tab");
        thumbBtn.setAttribute("aria-selected", index === initialIndex ? "true" : "false");
        thumbBtn.setAttribute("aria-label", `Fotografie ${index + 1}`);
        if (index === initialIndex) thumbBtn.classList.add("is-active");

        const thumbImg = document.createElement("img");
        thumbImg.src = src;
        thumbImg.alt = "";
        thumbBtn.appendChild(thumbImg);

        thumbBtn.addEventListener("click", () => {
          mainImg.src = src;
          thumbs.querySelectorAll(".shop-product-detail__thumb").forEach((el, i) => {
            el.classList.toggle("is-active", i === index);
            el.setAttribute("aria-selected", i === index ? "true" : "false");
          });
        });

        thumbs.appendChild(thumbBtn);
      });

      gallery.appendChild(thumbs);
    }

    return gallery;
  }

  function buildProductDetail(product, sizeChart, leadTimeNote, detailOptions) {
    const article = document.createElement("article");
    article.className = "shop-product-detail";
    article.id = `shop-product-${product.id}`;

    const layout = document.createElement("div");
    layout.className = "shop-product-detail__layout";

    const initialColor = (detailOptions && detailOptions.initialColor) || "";
    const gallery = buildProductGallery(product, initialColor);
    layout.appendChild(gallery);
    const mainImg = gallery.querySelector(".shop-product-detail__main-img");

    const info = document.createElement("div");
    info.className = "shop-product-detail__info shop-product__body";

    const headerEl = document.createElement("div");
    headerEl.className = "shop-product__header";

    const categoryMeta = detailOptions || {};
    if (categoryMeta.categoryLabel && categoryMeta.categoryHref) {
      const categoryLink = document.createElement("a");
      categoryLink.className =
        "shop-product__category shop-product-detail__category";
      categoryLink.href = categoryMeta.categoryHref;
      categoryLink.textContent = categoryMeta.categoryLabel;
      headerEl.appendChild(categoryLink);
    }

    const title = document.createElement("h1");
    title.className = "shop-product__title shop-product-detail__title";
    title.textContent = product.title || "";
    headerEl.appendChild(title);
    info.appendChild(headerEl);

    const variants = product.variants || {};
    const hasSizes = Array.isArray(variants.sizes) && variants.sizes.length;
    const colorOptions = normalizeColorOptions(variants);
    const hasColors = colorOptions.length > 0;

    const badgeText = productBadgeText(product);
    const preorderDefaultNote =
      "P┼Öedobjedn├ín├ş je mo┼żn├ę do 25. 10. 2026.\nPot├ę dod├ín├ş do 3ÔÇô4 t├Żdn┼».";
    const isPreorder =
      productBadgeModifier(badgeText) === "shop-product-badge--preorder";
    let noteText = product.leadTimeNote;
    if (isPreorder && !noteText) noteText = preorderDefaultNote;

    const statusEl = document.createElement("div");
    statusEl.className = "shop-product-detail__status";
    const badgeBar = buildProductBadgeBar(product, "shop-product-detail__badge-bar");
    if (badgeBar) statusEl.appendChild(badgeBar);
    if (isPreorder && noteText) {
      const leadTime = document.createElement("p");
      leadTime.className = "shop-product__lead-time shop-product-detail__lead-time";
      leadTime.textContent = noteText;
      statusEl.appendChild(leadTime);
    } else if (!badgeText && (noteText || leadTimeNote)) {
      const leadTime = document.createElement("p");
      leadTime.className = "shop-product__lead-time shop-product-detail__lead-time";
      leadTime.textContent = noteText || leadTimeNote;
      statusEl.appendChild(leadTime);
    }
    if (statusEl.childElementCount) info.appendChild(statusEl);

    let sizeSelect = null;
    let colorPicker = null;

    if (hasColors || hasSizes) {
      const variantsEl = document.createElement("div");
      variantsEl.className = "shop-product__variants";

      if (hasColors) {
        colorPicker = buildColorSwatches(
          colorOptions,
          (color) => {
            if (color.image && mainImg) mainImg.src = color.image;
          },
          { initialColor: initialColor }
        );
        variantsEl.appendChild(colorPicker.wrap);
      }

      if (hasSizes) {
        const sizeField = buildSelect("Velikost", variants.sizes, "Vyber velikost");
        sizeSelect = sizeField.select;
        sizeSelect.addEventListener("change", function () {
          sizeSelect.setCustomValidity("");
        });
        variantsEl.appendChild(sizeField.wrap);
      }

      info.appendChild(variantsEl);
    }

    const priceBlock = document.createElement("div");
    priceBlock.className = "shop-product__price-block shop-product-detail__price-block";
    const price = document.createElement("p");
    price.className = "shop-product__price";
    price.textContent = formatPrice(product);
    priceBlock.appendChild(price);
    info.appendChild(priceBlock);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn shop-product__btn shop-product-detail__add-btn";
    btn.textContent = "P┼Öidat do ko┼í├şku";

    const inStock = product.inStock !== false;
    if (!inStock) {
      btn.disabled = true;
      btn.textContent = "Vyprod├íno";
    } else if (window.ShopCart) {
      btn.addEventListener("click", () => {
        const size = sizeSelect ? sizeSelect.value : "";
        const color = colorPicker ? colorPicker.getValue() : "";
        if (sizeSelect && !size) {
          sizeSelect.setCustomValidity("Vyber pros├şm velikost.");
          sizeSelect.reportValidity();
          sizeSelect.focus();
          return;
        }
        if (sizeSelect) sizeSelect.setCustomValidity("");
        if (colorPicker && !color) {
          colorPicker.focus();
          return;
        }
        ShopCart.addItem(product, 1, { size, color });
        btn.textContent = "P┼Öid├íno Ôťô";
        setTimeout(() => {
          btn.textContent = "P┼Öidat do ko┼í├şku";
        }, 1200);
      });
    } else {
      btn.disabled = true;
    }

    info.appendChild(btn);

    const extrasEl = document.createElement("div");
    extrasEl.className = "shop-product-detail__extras";

    if (product.description) {
      const desc = document.createElement("p");
      desc.className = "shop-product__desc shop-product-detail__desc";
      desc.textContent = product.description;
      extrasEl.appendChild(desc);
    }

    if (
      hasSizes &&
      sizeChart &&
      Array.isArray(sizeChart.headers) &&
      Array.isArray(sizeChart.rows)
    ) {
      const sizeChartWrap = document.createElement("div");
      sizeChartWrap.className = "shop-product__size-chart-wrap";

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "shop-size-chart-toggle";
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML =
        '<span class="shop-size-chart-toggle__text">Tabulka velikost├ş</span>' +
        '<svg class="shop-size-chart-toggle__chevron" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>' +
        "</svg>";

      const panel = buildSizeChartPanel(sizeChart);
      toggle.addEventListener("click", () => {
        const open = panel.hidden;
        panel.hidden = !open;
        const expanded = open;
        toggle.classList.toggle("is-expanded", expanded);
        toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
      });

      sizeChartWrap.appendChild(toggle);
      sizeChartWrap.appendChild(panel);
      extrasEl.appendChild(sizeChartWrap);
    }

    if (extrasEl.childElementCount) info.appendChild(extrasEl);

    layout.appendChild(info);
    article.appendChild(layout);

    return article;
  }

  try {
    const [contentRes, productsRes] = await Promise.all([
      fetch("data/obchod-content.json", { cache: "no-store" }),
      fetch("data/obchod-products.json", { cache: "no-store" }),
    ]);

    const titleEl = document.getElementById("shop-title");
    const introEl = document.getElementById("shop-intro");
    const catalogViewEl = document.getElementById("shop-catalog-view");
    const gridEl = document.getElementById("shop-grid");
    const detailViewEl = document.getElementById("shop-detail-view");
    const emptyEl = document.getElementById("shop-empty");
    const filterEmptyEl = document.getElementById("shop-filter-empty");
    const filtersEl = document.getElementById("shop-category-filters");
    const shopPageEl = document.querySelector(".shop-page");
    const detailBackBtn = document.getElementById("shop-detail-back");

    let leadTimeNote = "";

    if (contentRes.ok) {
      const content = await contentRes.json();
      if (titleEl && content.title) titleEl.textContent = content.title;
      if (introEl && content.intro) introEl.textContent = content.intro;
      if (emptyEl && content.emptyMessage) emptyEl.textContent = content.emptyMessage;
      if (content.leadTimeNote) leadTimeNote = content.leadTimeNote;
    }

    if (!productsRes.ok || !gridEl || !emptyEl || !detailViewEl) return;

    const data = await productsRes.json();
    const sizeChart = data.sizeChart || null;
    const categories = data.categories || [];
    const products = (data.products || [])
      .map(normalizeProduct)
      .filter((item) => item.active !== false);

    if (!products.length) {
      emptyEl.hidden = false;
      gridEl.hidden = true;
      if (filtersEl) filtersEl.hidden = true;
      return;
    }

    emptyEl.hidden = true;
    let activeCategory = "all";

    function isValidCategoryId(id) {
      return id === "all" || categories.some((cat) => cat.id === id);
    }

    function categoryCatalogUrl(categoryId) {
      const url = new URL(window.location.href);
      url.searchParams.delete("produkt");
      if (categoryId && categoryId !== "all") {
        url.searchParams.set("kategorie", categoryId);
      } else {
        url.searchParams.delete("kategorie");
      }
      const search = url.searchParams.toString();
      return search ? `${url.pathname}?${search}` : url.pathname;
    }

    function productUrl(id, colorLabel) {
      return buildProductUrl(id, colorLabel);
    }

    function catalogUrl() {
      return categoryCatalogUrl(activeCategory);
    }

    function categoryLabelForProduct(product) {
      const id = product.category;
      if (!id) return "";
      const cat = categories.find((c) => c.id === id);
      return cat ? cat.label : "";
    }

    function syncCategoryFilters() {
      if (!filtersEl) return;
      filtersEl.querySelectorAll(".shop-category-filter").forEach((el) => {
        el.classList.toggle("is-active", el.dataset.category === activeCategory);
      });
    }

    function applyCategoryFromUrl(params) {
      const kat = params.get("kategorie");
      if (kat && isValidCategoryId(kat)) {
        activeCategory = kat;
      } else {
        activeCategory = "all";
      }
      syncCategoryFilters();
      renderProducts();
    }

    function setCatalogHeaderVisible(visible) {
      if (titleEl) titleEl.hidden = !visible;
      if (introEl) introEl.hidden = !visible;
    }

    function showCatalog(updateHistory = true) {
      if (catalogViewEl) catalogViewEl.hidden = false;
      detailViewEl.hidden = true;
      detailViewEl.innerHTML = "";
      setCatalogHeaderVisible(true);
      if (shopPageEl) shopPageEl.classList.remove("shop-page--detail");
      if (filtersEl && categories.length) filtersEl.hidden = false;
      if (detailBackBtn) detailBackBtn.hidden = true;
      if (updateHistory) {
        history.pushState({ view: "catalog" }, "", catalogUrl());
      }
      if (titleEl) {
        document.title = "Obchod | Psoch├ízky";
      }
    }

    function showProductDetail(productId, updateHistory = true, colorLabel) {
      const product = products.find((p) => p.id === productId);
      if (!product) {
        showCatalog(updateHistory);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const colorOptions = normalizeColorOptions(product.variants || {});
      const rawColor = colorLabel || params.get("barva") || "";
      const matchedColor = findColorOption(colorOptions, rawColor);
      const initialColor = matchedColor ? matchedColor.label : rawColor;

      setCatalogHeaderVisible(false);
      if (shopPageEl) shopPageEl.classList.add("shop-page--detail");
      if (filtersEl) filtersEl.hidden = true;
      if (detailBackBtn) detailBackBtn.hidden = false;
      if (catalogViewEl) catalogViewEl.hidden = true;
      detailViewEl.hidden = false;
      detailViewEl.innerHTML = "";

      const categoryLabel = categoryLabelForProduct(product);
      const categoryId = product.category;
      detailViewEl.appendChild(
        buildProductDetail(product, sizeChart, leadTimeNote, {
          categoryLabel,
          categoryHref:
            categoryLabel && categoryId
              ? categoryCatalogUrl(categoryId)
              : "",
          initialColor,
        })
      );

      if (titleEl && product.title) {
        document.title = `${product.title} | Obchod | Psoch├ízky`;
      }

      if (updateHistory) {
        history.pushState(
          { view: "product", productId, color: initialColor || undefined },
          "",
          productUrl(productId, initialColor || null)
        );
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function renderProducts() {
      gridEl.innerHTML = "";
      const filtered =
        activeCategory === "all"
          ? products
          : products.filter((p) => p.category === activeCategory);

      if (!filtered.length) {
        gridEl.hidden = true;
        if (filterEmptyEl) filterEmptyEl.hidden = false;
        return;
      }

      gridEl.hidden = false;
      if (filterEmptyEl) filterEmptyEl.hidden = true;

      filtered.forEach((product) => {
        gridEl.appendChild(buildCatalogTile(product, showProductDetail));
      });
    }

    if (filtersEl && categories.length) {
      filtersEl.innerHTML = "";

      function addFilterButton(id, label) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "shop-category-filter";
        btn.dataset.category = id;
        btn.textContent = label;
        if (id === activeCategory) btn.classList.add("is-active");
        btn.addEventListener("click", () => {
          activeCategory = id;
          syncCategoryFilters();
          renderProducts();
          if (!detailViewEl.hidden) return;
          history.pushState({ view: "catalog", category: id }, "", catalogUrl());
        });
        filtersEl.appendChild(btn);
      }

      addFilterButton("all", "V┼íe");
      categories.forEach((cat) => addFilterButton(cat.id, cat.label));
    }

    const initialParams = new URLSearchParams(window.location.search);
    applyCategoryFromUrl(initialParams);
    renderProducts();

    if (detailBackBtn) {
      detailBackBtn.addEventListener("click", () => {
        showCatalog(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    window.addEventListener("popstate", () => {
      const params = new URLSearchParams(window.location.search);
      applyCategoryFromUrl(params);
      const productId = params.get("produkt");
      if (productId) {
        showProductDetail(productId, false, params.get("barva") || "");
      } else {
        showCatalog(false);
      }
    });

    const initialProduct = initialParams.get("produkt");
    if (initialProduct) {
      showProductDetail(initialProduct, false, initialParams.get("barva") || "");
    } else {
      showCatalog(false);
    }
  } catch (error) {
    console.error("CMS obchod load error:", error);
  }
})();
