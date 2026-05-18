(function () {
  function escapeHtml(text) {
    return String(text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(text) {
    return escapeHtml(text).replace(/'/g, "&#39;");
  }

  const ICON_MESSENGER =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0b3329" style="width: 22px; height: 22px;"><path d="M12 0C5.372 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.628 0 12-4.974 12-11.111C24 4.975 18.628 0 12 0zm1.191 14.963l-3.055-3.26L4.863 14.963 11.309 8.04l3.135 3.26L19.764 8.04l-6.573 6.923z"/></svg>';
  const ICON_EMAIL =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0b3329" style="width: 22px; height: 22px;"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>';
  const ICON_LOCATION =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0b3329" style="width: 22px; height: 22px;"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';

  const CONTACT_ICON_WRAP =
    "width: 45px; height: 45px; background-color: #d4a373; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-right: 15px; flex-shrink: 0;";

  function bodyLinesToHtml(lines, wrapperClass) {
    if (!Array.isArray(lines) || !lines.length) return "";
    const lineStrs = lines.map((line) =>
      typeof line === "string" ? line : line && (line.line || line.text || "")
    );
    const ps = lineStrs.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
    return wrapperClass ? `<div class="${wrapperClass}">${ps}</div>` : ps;
  }

  function renderPriceTop(amount, unitSuffix) {
    const amountHtml = escapeHtml(amount || "");
    if (unitSuffix) {
      return `<p class="price-item__price-top"><span class="price-item__amount">${amountHtml}</span><span class="price-item__unit price-item__unit--suffix">${escapeHtml(unitSuffix)}</span></p>`;
    }
    return `<p class="price-item__price-top"><span class="price-item__amount">${amountHtml}</span></p>`;
  }

  function renderPriceArticle(item) {
    const variant = item.variant || "full";
    const amount = item.amount || "";
    const unitSuffix = item.unitSuffix;

    if (variant === "card") {
      const metaHtml = item.meta ? `<p class="price-item__meta">${escapeHtml(item.meta)}</p>` : "";
      const bodyHtml = bodyLinesToHtml(item.bodyLines, "price-item__body");
      return `
        <article class="price-item price-item--card">
          <h3 class="price-item__title">${escapeHtml(item.title || "")}</h3>
          ${metaHtml}
          ${renderPriceTop(amount, unitSuffix)}
          ${bodyHtml}
        </article>
      `;
    }

    const classes = ["price-item"];
    if (variant === "compact") classes.push("price-item--compact");
    if (variant === "solo") classes.push("price-item--solo");

    const priceInner = unitSuffix
      ? `<span class="price-item__amount">${escapeHtml(amount)}</span><span class="price-item__unit price-item__unit--suffix">${escapeHtml(unitSuffix)}</span>`
      : `<span class="price-item__amount">${escapeHtml(amount)}</span>`;

    const metaHtml = item.meta ? `<p class="price-item__meta">${escapeHtml(item.meta)}</p>` : "";
    const bodyHtml = bodyLinesToHtml(item.bodyLines, "price-item__body");

    return `
      <article class="${classes.join(" ")}">
        <header class="price-item__header">
          <h3>${escapeHtml(item.title || "")}</h3>
          <p class="price-item__price">${priceInner}</p>
        </header>
        ${metaHtml}
        ${bodyHtml}
      </article>
    `;
  }

  function renderCenikCta(cta) {
    if (!cta || !cta.href) return "";
    if (cta.buttonText) {
      const noteHtml = cta.note ? `<p class="cenik-cta__note">${escapeHtml(cta.note)}</p>` : "";
      const isExternal =
        cta.external === true || /^https?:\/\//i.test(String(cta.href || ""));
      const extAttrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<div class="cenik-cta"><a href="${escapeAttr(cta.href)}" class="btn"${extAttrs}>${escapeHtml(cta.buttonText)}</a>${noteHtml}</div>`;
    }
    const linkText = cta.text || cta.href;
    const intro = cta.intro
      ? `<span class="cenik-cta__link-intro">${escapeHtml(cta.intro)} </span>`
      : "";
    return `<p class="cenik-cta__link">${intro}<a href="${escapeAttr(cta.href)}">${escapeHtml(linkText)}</a></p>`;
  }

  function renderPermanentkyItem(item) {
    const bodyHtml = bodyLinesToHtml(item.bodyLines, "cenik-permanentky__body");
    return `
      <article class="cenik-permanentky__item">
        <h4 class="cenik-permanentky__item-title">${escapeHtml(item.title || "")}</h4>
        ${renderPriceTop(item.amount, item.unitSuffix)}
        ${bodyHtml}
      </article>
    `;
  }

  function renderBlock(block) {
    if (!block || !block.type) return "";

    switch (block.type) {
      case "h1":
        return `<h1>${escapeHtml(block.text)}</h1>`;

      case "h2": {
        const id = block.id ? ` id="${escapeAttr(block.id)}"` : "";
        return `<h2${id}>${escapeHtml(block.text)}</h2>`;
      }

      case "h3": {
        const cn = block.className || block.class;
        const cls = cn ? ` class="${escapeAttr(cn)}"` : "";
        return `<h3${cls}>${escapeHtml(block.text)}</h3>`;
      }

      case "p": {
        const cn = block.className || block.class;
        const cls = cn ? ` class="${escapeAttr(cn)}"` : "";
        return `<p${cls}>${escapeHtml(block.text)}</p>`;
      }

      case "article_intro": {
        if (!Array.isArray(block.paragraphs)) return "";
        const ps = block.paragraphs
          .map((t) => {
            const s = typeof t === "string" ? t : t && (t.text || t.item || "");
            return `<p>${escapeHtml(s)}</p>`;
          })
          .join("");
        return `<div class="article-intro">${ps}</div>`;
      }

      case "figure":
        return `
          <figure class="article-figure article-figure--medium">
            <img src="${escapeAttr(block.src)}" alt="${escapeAttr(block.alt || "")}" loading="lazy" decoding="async" />
          </figure>
        `;

      case "hr":
        return '<hr class="article-divider" aria-hidden="true" />';

      case "ul":
        if (!Array.isArray(block.items)) return "";
        const lis = block.items
          .map((t) => {
            const s = typeof t === "string" ? t : t && (t.item || t.text || "");
            return `<li>${escapeHtml(s)}</li>`;
          })
          .join("");
        return `<ul>${lis}</ul>`;

      case "quote_bubble":
        return `
          <div class="quote-bubble">
            <p class="quote-bubble__text">${escapeHtml(block.text || "").replace(/\n/g, "<br>")}</p>
          </div>
        `;

      case "quote_bubble_cenik":
        return `
          <div class="quote-bubble quote-bubble--cenik">
            <p class="quote-bubble__text">${escapeHtml(block.text || "").replace(/\n/g, "<br>")}</p>
          </div>
        `;

      case "cenik_intro": {
        if (!Array.isArray(block.lines)) return "";
        const ps = block.lines
          .map((t) => {
            const s = typeof t === "string" ? t : t && (t.line || t.text || "");
            return `<p>${escapeHtml(s)}</p>`;
          })
          .join("");
        return `<div class="cenik__intro">${ps}</div>`;
      }

      case "cenik_section": {
        const labelledBy = block.ariaLabelledBy ? ` aria-labelledby="${escapeAttr(block.ariaLabelledBy)}"` : "";
        const mod = block.sectionClass ? ` ${escapeAttr(block.sectionClass)}` : "";
        const inner = Array.isArray(block.blocks) ? block.blocks.map(renderBlock).join("") : "";
        return `<section class="cenik__section${mod}"${labelledBy}>${inner}</section>`;
      }

      case "cenik_service_card": {
        const headingId = block.headingId ? escapeAttr(block.headingId) : "";
        const idAttr = headingId ? ` id="${headingId}"` : "";
        const mod = block.sectionClass ? ` ${escapeAttr(block.sectionClass)}` : "";
        const labelledBy = headingId ? ` aria-labelledby="${headingId}"` : "";
        const inner = Array.isArray(block.blocks) ? block.blocks.map(renderBlock).join("") : "";
        const title = block.title
          ? `<h2 class="cenik-service-card__title"${idAttr}>${escapeHtml(block.title)}</h2>`
          : "";
        return `<section class="cenik-service-card${mod}"${labelledBy}>${title}${inner}</section>`;
      }

      case "permanentky_box": {
        if (!Array.isArray(block.items) || !block.items.length) return "";
        const items = block.items.map(renderPermanentkyItem).join("");
        const title = block.title
          ? `<h3 class="cenik-permanentky__title">${escapeHtml(block.title)}</h3>`
          : "";
        const linkHtml = renderCenikCta(block.link);
        return `<div class="cenik-permanentky">${title}<div class="cenik-permanentky__grid">${items}</div></div>${linkHtml}`;
      }

      case "price_grid": {
        if (!Array.isArray(block.items)) return "";
        const inner = block.items.map(renderPriceArticle).join("");
        const layout = block.layout || "two";
        if (layout === "solo") {
          return `<div class="cenik__grid cenik__grid--solo">${inner}</div>`;
        }
        if (layout === "cards") {
          return `<div class="cenik__grid cenik__grid--cards">${inner}</div>`;
        }
        if (layout === "row") {
          return `<div class="cenik__grid cenik__grid--row">${inner}</div>`;
        }
        return `<div class="cenik__grid cenik__grid--2">${inner}</div>`;
      }

      case "cenik_cta":
        return renderCenikCta(block);

      case "prose":
        return `<p class="cenik__prose">${escapeHtml(block.text)}</p>`;

      case "info_box":
        return `
          <div class="cenik__info-box">
            <p><strong>${escapeHtml(block.title)}</strong></p>
            <p>${escapeHtml(block.body)}</p>
          </div>
        `;

      case "payments": {
        const listItems = (block.listItems || [])
          .map((t) => {
            const s = typeof t === "string" ? t : t && (t.item || t.text || "");
            return `<li>${escapeHtml(s)}</li>`;
          })
          .join("");
        const afterListHtml = block.afterList
          ? `<p class="cenik__payments-after-list">${escapeHtml(block.afterList)}</p>`
          : "";
        return `
          <div class="cenik__payments">
            <p>${escapeHtml(block.intro)}</p>
            <p><strong>${escapeHtml(block.afterIntroBold)}</strong></p>
            <ul>${listItems}</ul>
            ${afterListHtml}
            <p class="cenik__payments-note">${escapeHtml(block.note)}</p>
          </div>
        `;
      }

      case "cta": {
        if (!Array.isArray(block.buttons)) return "";
        const btns = block.buttons
          .map((b) => {
            const ext = b.external ? ' target="_blank" rel="noopener noreferrer"' : "";
            return `<a href="${escapeAttr(b.href)}" class="btn"${ext}>${escapeHtml(b.text)}</a>`;
          })
          .join("");
        return `<div class="page-content__cta">${btns}</div>`;
      }

      case "map_embed": {
        const src = block.src || "https://mapy.com/s/motedezapu";
        const title = block.title || "Mapa";
        return `
          <div class="kontakt-map">
            <iframe
              class="kontakt-map__iframe"
              src="${escapeAttr(src)}"
              title="${escapeAttr(title)}"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        `;
      }

      case "contact_list": {
        if (!Array.isArray(block.rows)) return "";
        const rows = block.rows
          .map((row) => {
            let inner = "";
            if (row.kind === "messenger") {
              inner = `<a href="${escapeAttr(row.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.linkLabel)}</a> ${escapeHtml(row.suffix || "")}`;
            } else if (row.kind === "email") {
              inner = `<a href="${escapeAttr(row.href)}">${escapeHtml(row.linkLabel)}</a> ${escapeHtml(row.suffix || "")}`;
            } else {
              inner = escapeHtml(row.text || "");
            }
            const icon =
              row.kind === "messenger" ? ICON_MESSENGER : row.kind === "email" ? ICON_EMAIL : ICON_LOCATION;
            return `
              <li style="margin-bottom: 15px; display: flex; align-items: center;">
                <div style="${CONTACT_ICON_WRAP}">${icon}</div>
                <div>${inner}</div>
              </li>
            `;
          })
          .join("");
        return `<ul style="list-style: none; padding-left: 0;">${rows}</ul>`;
      }

      case "markdown": {
        const raw = block.body || "";
        if (typeof marked !== "undefined" && typeof marked.parse === "function") {
          let html = marked.parse(raw);
          html = html.replace(
            /<a href="(https?:\/\/[^"]+)"/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer"'
          );
          return `<div class="cms-markdown">${html}</div>`;
        }
        return `<div class="cms-markdown"><p>${escapeHtml(raw)}</p></div>`;
      }

      default:
        return "";
    }
  }

  function renderBlocks(blocks) {
    if (!Array.isArray(blocks)) return "";
    return blocks.map(renderBlock).join("");
  }

  window.CmsBlocks = {
    escapeHtml,
    renderBlock,
    renderBlocks,
  };
})();
