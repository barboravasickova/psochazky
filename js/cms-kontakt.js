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

  const ICONS = {
    messenger: `<svg class="kontakt-card__icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.372 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.628 0 12-4.974 12-11.111C24 4.975 18.628 0 12 0zm1.191 14.963l-3.055-3.26L4.863 14.963 11.309 8.04l3.135 3.26L19.764 8.04l-6.573 6.923z"/></svg>`,
    email: `<svg class="kontakt-card__icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
    location: `<svg class="kontakt-card__icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  };

  function renderList(items) {
    if (!Array.isArray(items) || !items.length) return "";
    const lis = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    return `<ul class="kontakt-panel__list">${lis}</ul>`;
  }

  function renderQuickCardIcon(contact, icon) {
    const kind = contact.kind || "location";
    const href = contact.href || "";
    if (!href) {
      return `<span class="kontakt-card__icon" aria-hidden="true">${icon}</span>`;
    }

    const ext =
      kind === "messenger" || kind === "location"
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
    const ariaLabels = {
      messenger: "Otevřít Messenger",
      email: "Napsat e-mail",
      location: "Zobrazit na mapě",
    };
    const ariaLabel = ariaLabels[kind] || contact.cardTitle || "";

    return `<a href="${escapeAttr(href)}" class="kontakt-card__icon-link"${ext} aria-label="${escapeAttr(ariaLabel)}"><span class="kontakt-card__icon">${icon}</span></a>`;
  }

  function renderQuickCard(contact) {
    const kind = contact.kind || "location";
    const icon = ICONS[kind] || ICONS.location;
    const title = contact.cardTitle || contact.kind || "";

    let body = "";
    if (kind === "location") {
      body = `<p class="kontakt-card__text">${escapeHtml(contact.text || "")}</p>`;
    } else {
      const ext = kind === "messenger" ? ' target="_blank" rel="noopener noreferrer"' : "";
      body = `
        <p class="kontakt-card__link-wrap">
          <a href="${escapeAttr(contact.href)}" class="kontakt-card__link"${ext}>${escapeHtml(contact.linkText)}</a>
        </p>
        ${contact.detail ? `<p class="kontakt-card__detail">${escapeHtml(contact.detail)}</p>` : ""}
      `;
    }

    return `
      <article class="kontakt-card kontakt-card--${escapeAttr(kind)}">
        ${renderQuickCardIcon(contact, icon)}
        <h3 class="kontakt-card__title">${escapeHtml(title)}</h3>
        ${body}
      </article>
    `;
  }

  function renderQuickContacts(contacts) {
    if (!Array.isArray(contacts) || !contacts.length) return "";
    return `
      <section class="kontakt-page__section kontakt-page__quick" aria-label="Rychlé kontakty">
        <div class="kontakt-quick">${contacts.map(renderQuickCard).join("")}</div>
      </section>
    `;
  }

  function renderBooking(booking) {
    if (!booking) return "";
    const booqitoBtn =
      booking.booqitoUrl
        ? `<p class="kontakt-panel__cta">
            <a href="${escapeAttr(booking.booqitoUrl)}" class="btn btn--booqito" target="_blank" rel="noopener noreferrer">${escapeHtml(booking.booqitoButtonText || "Přihlásit se přes rezervační systém")}</a>
          </p>`
        : "";

    return `
      <article class="kontakt-panel kontakt-panel--booking">
        <h2 class="kontakt-panel__title">${escapeHtml(booking.title)}</h2>
        ${booking.intro ? `<p>${escapeHtml(booking.intro)}</p>` : ""}
        ${renderList(booking.features)}
        ${booking.paymentNote ? `<p>${escapeHtml(booking.paymentNote)}</p>` : ""}
        ${booqitoBtn}
      </article>
    `;
  }

  function renderIndividual(individual) {
    if (!individual) return "";
    const paragraphs = (individual.paragraphs || [])
      .map((text) => `<p>${escapeHtml(text)}</p>`)
      .join("");
    const booqitoBtn =
      individual.booqitoUrl
        ? `<p class="kontakt-panel__cta">
            <a href="${escapeAttr(individual.booqitoUrl)}" class="btn btn--booqito" target="_blank" rel="noopener noreferrer">${escapeHtml(individual.booqitoButtonText || "Rezervovat individuálku")}</a>
          </p>`
        : "";
    return `
      <article class="kontakt-panel kontakt-panel--individual">
        <h2 class="kontakt-panel__title">${escapeHtml(individual.title)}</h2>
        ${paragraphs}
        ${booqitoBtn}
      </article>
    `;
  }

  function renderCooperation(coop) {
    if (!coop) return "";
    return `
      <section class="kontakt-page__section kontakt-page__cooperation">
        <div class="kontakt-cooperation">
          <h2 class="kontakt-cooperation__title">${escapeHtml(coop.title)}</h2>
          ${renderList(coop.items)}
          ${coop.docaskyIntro ? `<p class="kontakt-cooperation__docasky-intro"><strong>${escapeHtml(coop.docaskyIntro)}</strong></p>` : ""}
          ${renderList(coop.docaskyItems)}
          ${coop.footer ? `<p class="kontakt-cooperation__footer">${escapeHtml(coop.footer)}</p>` : ""}
        </div>
      </section>
    `;
  }

  function renderMap(map) {
    if (!map || !map.src) return "";
    const title = map.sectionTitle || "Kde najdete Psocházky?";
    return `
      <section class="kontakt-page__map-section" aria-labelledby="kontakt-map-heading">
        <div class="kontakt-page__container">
          <h2 id="kontakt-map-heading" class="kontakt-page__map-title">${escapeHtml(title)}</h2>
          <div class="kontakt-map">
            <iframe
              class="kontakt-map__iframe"
              src="${escapeAttr(map.src)}"
              title="${escapeAttr(map.iframeTitle || title)}"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    `;
  }

  function renderOperatorInfo(text) {
    if (!text) return "";
    return `<p class="kontakt-page__operator">${escapeHtml(text)}</p>`;
  }

  function renderPage(data) {
    return `
      <div class="kontakt-page__body">
        <div class="kontakt-page__container">
          <header class="kontakt-page__header">
            <h1>${escapeHtml(data.title || "Kontakt")}</h1>
            ${data.intro ? `<p class="kontakt-page__intro">${escapeHtml(data.intro)}</p>` : ""}
          </header>
          ${renderQuickContacts(data.quickContacts)}
          <section class="kontakt-page__section kontakt-page__columns-wrap" aria-label="Přihlášení a tréninky">
            <div class="kontakt-page__columns">
              ${renderBooking(data.booking)}
              ${renderIndividual(data.individual)}
            </div>
          </section>
          ${renderCooperation(data.cooperation)}
          ${renderOperatorInfo(data.operatorInfo)}
        </div>
      </div>
      ${renderMap(data.map)}
    `;
  }

  function renderLegacyBlocks(blocks) {
    if (!window.CmsBlocks || !Array.isArray(blocks)) return "";
    return window.CmsBlocks.renderBlocks(blocks);
  }

  (async () => {
    try {
      const root = document.getElementById("cms-kontakt-root");
      if (!root) return;
      const response = await fetch("data/kontakt-content.json", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();

      if (data.title || data.quickContacts) {
        root.innerHTML = renderPage(data);
      } else if (Array.isArray(data.blocks)) {
        root.innerHTML = `<div class="kontakt-page__container page-content">${renderLegacyBlocks(data.blocks)}</div>`;
      }
    } catch (error) {
      console.error("CMS kontakt content load error:", error);
    }
  })();
})();
