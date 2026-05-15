(async () => {
  try {
    const response = await fetch("data/home-content.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();

    function pick(section, key) {
      const s = data[section];
      if (s && typeof s === "object" && s[key] !== undefined && s[key] !== null && s[key] !== "") return s[key];
      return data[key];
    }

    function setHeadingWithLineBreaks(el, text) {
      el.textContent = "";
      String(text)
        .split("\n")
        .forEach((line, index) => {
          if (index > 0) el.appendChild(document.createElement("br"));
          el.appendChild(document.createTextNode(line));
        });
    }

    function setHeroDescription(el, lead, body) {
      el.textContent = "";
      if (lead) {
        const strong = document.createElement("strong");
        strong.className = "hero__description-lead";
        strong.textContent = lead;
        el.appendChild(strong);
        if (body) el.appendChild(document.createTextNode(" "));
      }
      if (body) el.appendChild(document.createTextNode(body));
    }

    const heroTitle = document.querySelector(".hero__text-content h1");
    const heroDescription = document.querySelector(".hero__description");
    const heroButton = document.querySelector(".hero__text-content .btn");
    if (heroTitle) {
      const v = pick("hero", "heroTitle");
      if (v) heroTitle.textContent = v;
    }
    if (heroDescription) {
      const lead = pick("hero", "heroDescriptionLead");
      const body = pick("hero", "heroDescription");
      if (lead || body) setHeroDescription(heroDescription, lead, body);
    }
    if (heroButton) {
      const v = pick("hero", "heroButtonText");
      if (v) heroButton.textContent = v;
    }

    const manifestTitle = document.querySelector(".manifest .section-title");
    const manifestText = document.querySelector(".manifest .manifest__content");
    const manifestButton = document.querySelector(".manifest .btn");
    if (manifestTitle) {
      const v = pick("manifest", "manifestTitle");
      if (v) setHeadingWithLineBreaks(manifestTitle, v);
    }
    if (manifestText) {
      const v = pick("manifest", "manifestText");
      if (v) manifestText.textContent = v;
    }
    if (manifestButton) {
      const v = pick("manifest", "manifestButtonText");
      if (v) manifestButton.textContent = v;
    }

    const servicesTitle = document.querySelector(".services .section-title");
    if (servicesTitle) {
      const v = pick("services", "servicesTitle");
      if (v) servicesTitle.textContent = v;
    }

    const servicesIntro = document.querySelector(".services > .container > p");
    if (servicesIntro) {
      const v = pick("services", "servicesIntroText");
      if (v) servicesIntro.textContent = v;
    }

    const cards = (data.services && Array.isArray(data.services.servicesCards) ? data.services.servicesCards : null) || data.servicesCards;
    const serviceCards = document.querySelectorAll(".service__card");
    if (Array.isArray(cards)) {
      cards.forEach((card, index) => {
        const item = serviceCards[index];
        if (!item) return;
        const title = item.querySelector("h3");
        const text = item.querySelector("p");
        const button = item.querySelector(".btn");
        if (title && card.title) title.textContent = card.title;
        if (text && card.text) text.textContent = card.text;
        if (button && card.buttonText) button.textContent = card.buttonText;
      });
    }

    const quoteBlock = document.querySelector(".quote__blockquote");
    const quoteSignature = document.querySelector(".quote__signature p");
    if (quoteBlock) {
      const v = pick("quote", "quoteText");
      if (v) {
        const clean = String(v)
          .replace(/^[\s"„"']+|[\s"„"']+$/g, "")
          .trim();
        const parts = clean.split(/\n\n+/).filter(Boolean);
        quoteBlock.replaceChildren();
        parts.forEach((part) => {
          const p = document.createElement("p");
          p.className = "quote__text";
          p.textContent = part.trim();
          quoteBlock.appendChild(p);
        });
      }
    }
    if (quoteSignature) {
      const v = pick("quote", "quoteSignature");
      if (v) setHeadingWithLineBreaks(quoteSignature, v);
    }

    const forWhomTitle = document.querySelector(".for-whom .section-title");
    if (forWhomTitle) {
      const v = pick("forWhom", "forWhomTitle");
      if (v) forWhomTitle.textContent = v;
    }
    const items = (data.forWhom && Array.isArray(data.forWhom.forWhomItems) ? data.forWhom.forWhomItems : null) || data.forWhomItems;
    if (Array.isArray(items)) {
      const listItems = document.querySelectorAll(".for-whom .checklist li");
      items.forEach((entry, index) => {
        const text = typeof entry === "string" ? entry : entry && entry.item;
        const li = listItems[index];
        if (!li || !text) return;
        let textEl = li.querySelector(".checklist__text");
        if (!textEl) {
          const icon = li.querySelector(".checklist__icon, img");
          li.replaceChildren();
          if (icon) li.appendChild(icon);
          textEl = document.createElement("span");
          textEl.className = "checklist__text";
          li.appendChild(textEl);
        }
        textEl.textContent = text;
      });
    }
    const forWhomButton = document.querySelector(".for-whom__action .button");
    if (forWhomButton) {
      const v = pick("forWhom", "forWhomButtonText");
      if (v) forWhomButton.textContent = v;
    }

    const bottomText = document.querySelector(".psochazky__text p");
    if (bottomText) {
      const v = pick("bottom", "bottomText");
      if (v) bottomText.textContent = v;
    }
  } catch (error) {
    console.error("CMS home content load error:", error);
  }
})();
