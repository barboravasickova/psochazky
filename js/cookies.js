(function () {
  "use strict";

  const GA_ID = "G-HDQZ4H1ZZ1";
  const STORAGE_KEY = "cookie_consent";
  const LEGACY_STORAGE_KEY = "psochazky_cookie_consent";

  const script = document.currentScript;
  const rootUrl = script ? new URL("../", script.src) : new URL("./", window.location.href);
  const gdprHref = new URL("gdpr.html", rootUrl).pathname;

  function migrateLegacyConsent() {
    try {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy && !localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, legacy);
      }
      if (legacy) {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }

  function getConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }

  function getAnalyticsToggle() {
    return document.querySelector("[data-analytics-toggle]");
  }

  function loadAnalytics() {
    if (window.__psochazkyGaLoaded) return;
    window.__psochazkyGaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });

    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(gaScript);
  }

  function applyStoredConsent() {
    if (getConsent() === "accepted") {
      loadAnalytics();
    }
  }

  function getBanner() {
    return document.getElementById("cookie-banner");
  }

  function getModal() {
    return document.getElementById("cookie-settings");
  }

  function syncToggleFromConsent() {
    const toggle = getAnalyticsToggle();
    if (!toggle) return;
    toggle.checked = getConsent() === "accepted";
  }

  function hideBanner() {
    const banner = getBanner();
    if (!banner) return;
    banner.classList.remove("cookie-banner--visible");
    banner.setAttribute("aria-hidden", "true");
  }

  function showBanner() {
    const banner = getBanner();
    if (!banner) return;
    banner.classList.add("cookie-banner--visible");
    banner.setAttribute("aria-hidden", "false");
  }

  function hideModal() {
    const modal = getModal();
    if (!modal) return;
    modal.classList.remove("cookie-settings--visible");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cookie-settings-open");
    if (!getConsent()) {
      showBanner();
    }
  }

  function showModal() {
    const modal = getModal();
    if (!modal) return;
    syncToggleFromConsent();
    hideBanner();
    modal.classList.add("cookie-settings--visible");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("cookie-settings-open");
  }

  function acceptAll() {
    const toggle = getAnalyticsToggle();
    if (toggle) {
      toggle.checked = true;
    }
    setConsent("accepted");
    loadAnalytics();
    hideBanner();
    hideModal();
  }

  function rejectAll() {
    const toggle = getAnalyticsToggle();
    if (toggle) {
      toggle.checked = false;
    }
    setConsent("rejected");
    hideBanner();
    hideModal();
  }

  function saveSettings() {
    const toggle = getAnalyticsToggle();
    const accepted = Boolean(toggle && toggle.checked);
    setConsent(accepted ? "accepted" : "rejected");
    if (accepted) {
      loadAnalytics();
    }
    hideBanner();
    hideModal();
  }

  function createCookieRow(label, description, options) {
    const row = document.createElement("div");
    row.className = "cookie-settings__row";

    const text = document.createElement("div");
    text.className = "cookie-settings__row-text";

    const heading = document.createElement("h3");
    heading.textContent = label;

    const desc = document.createElement("p");
    desc.textContent = description;

    text.append(heading, desc);

    const switchLabel = document.createElement("label");
    switchLabel.className = "cookie-settings__switch";
    if (options.disabled) {
      switchLabel.classList.add("cookie-settings__switch--disabled");
    }

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = options.checked;
    if (options.disabled) {
      input.disabled = true;
    }
    if (options.analytics) {
      input.setAttribute("data-analytics-toggle", "");
    }

    const slider = document.createElement("span");
    slider.className = "cookie-settings__slider";
    slider.setAttribute("aria-hidden", "true");

    switchLabel.append(input, slider);
    row.append(text, switchLabel);

    return row;
  }

  function createBanner() {
    if (getBanner()) return;

    const banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.className = "cookie-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Informace o cookies");
    banner.setAttribute("aria-hidden", "true");

    const inner = document.createElement("div");
    inner.className = "cookie-banner__inner";

    const text = document.createElement("p");
    text.className = "cookie-banner__text";
    text.append(
      document.createTextNode(
        "Tento web používá cookies. Nezbytné cookies zajišťují fungování webu. Analytické cookies (Google Analytics) nám pomáhají zlepšovat obsah a návštěvnost. Používáme je pouze s vaším souhlasem. Více informací v "
      )
    );
    const gdprLink = document.createElement("a");
    gdprLink.href = gdprHref;
    gdprLink.textContent = "Ochraně osobních údajů";
    text.append(gdprLink, document.createTextNode("."));

    const actions = document.createElement("div");
    actions.className = "cookie-banner__actions";

    const acceptBtn = document.createElement("button");
    acceptBtn.type = "button";
    acceptBtn.className = "cookie-banner__btn cookie-banner__btn--primary";
    acceptBtn.textContent = "Přijmout vše";
    acceptBtn.addEventListener("click", acceptAll);

    const rejectBtn = document.createElement("button");
    rejectBtn.type = "button";
    rejectBtn.className = "cookie-banner__btn cookie-banner__btn--secondary";
    rejectBtn.textContent = "Odmítnout";
    rejectBtn.addEventListener("click", rejectAll);

    const settingsBtn = document.createElement("button");
    settingsBtn.type = "button";
    settingsBtn.className = "cookie-banner__link";
    settingsBtn.textContent = "Nastavení cookies";
    settingsBtn.addEventListener("click", openSettings);

    actions.append(acceptBtn, rejectBtn, settingsBtn);
    inner.append(text, actions);
    banner.append(inner);
    document.body.appendChild(banner);
  }

  function createModal() {
    if (getModal()) return;

    const modal = document.createElement("div");
    modal.id = "cookie-settings";
    modal.className = "cookie-settings";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "cookie-settings-title");
    modal.setAttribute("aria-hidden", "true");

    const backdrop = document.createElement("div");
    backdrop.className = "cookie-settings__backdrop";
    backdrop.addEventListener("click", hideModal);

    const panel = document.createElement("div");
    panel.className = "cookie-settings__panel";

    const title = document.createElement("h2");
    title.id = "cookie-settings-title";
    title.className = "cookie-settings__title";
    title.textContent = "Nastavení cookies";

    const intro = document.createElement("p");
    intro.className = "cookie-settings__intro";
    intro.textContent =
      "Nezbytné cookies jsou vždy aktivní. Analytické cookies můžete povolit nebo zakázat.";

    const categories = document.createElement("div");
    categories.className = "cookie-settings__categories";
    categories.append(
      createCookieRow("Nezbytné cookies", "Nutné pro fungování webu.", {
        checked: true,
        disabled: true,
        analytics: false,
      }),
      createCookieRow(
        "Analytické cookies (Google Analytics)",
        "Pomáhají analyzovat návštěvnost webu. Pouze se souhlasem.",
        { checked: false, disabled: false, analytics: true }
      )
    );

    const actions = document.createElement("div");
    actions.className = "cookie-settings__actions";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "cookie-settings__btn cookie-settings__btn--primary";
    saveBtn.textContent = "Uložit";
    saveBtn.addEventListener("click", saveSettings);

    actions.append(saveBtn);
    panel.append(title, intro, categories, actions);
    modal.append(backdrop, panel);
    document.body.appendChild(modal);
  }

  function injectFooterLink() {
    const container = document.querySelector(".footer__bottom-links");
    if (!container || container.querySelector("[data-cookie-settings]")) return;

    const separator = document.createElement("span");
    separator.className = "footer__separator";
    separator.textContent = "|";

    const link = document.createElement("a");
    link.href = "#";
    link.setAttribute("data-cookie-settings", "");
    link.textContent = "Nastavení cookies";
    link.addEventListener("click", function (event) {
      event.preventDefault();
      openSettings();
    });

    container.appendChild(separator);
    container.appendChild(link);
  }

  function openSettings() {
    createBanner();
    createModal();
    showModal();
  }

  function init() {
    migrateLegacyConsent();
    createBanner();
    createModal();
    injectFooterLink();

    const consent = getConsent();
    if (consent === "accepted") {
      applyStoredConsent();
      hideBanner();
      hideModal();
    } else if (consent === "rejected") {
      hideBanner();
      hideModal();
    } else {
      showBanner();
      hideModal();
    }
  }

  window.PsochazkyCookies = {
    openSettings: openSettings,
    getConsent: getConsent,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
