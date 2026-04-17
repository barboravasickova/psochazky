(async () => {
  try {
    const response = await fetch("data/home-content.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();

    const heroTitle = document.querySelector(".hero__text-content h1");
    const heroDescription = document.querySelector(".hero__description");
    const heroButton = document.querySelector(".hero__text-content .btn");
    if (heroTitle && data.heroTitle) heroTitle.textContent = data.heroTitle;
    if (heroDescription && data.heroDescription) heroDescription.textContent = data.heroDescription;
    if (heroButton && data.heroButtonText) heroButton.textContent = data.heroButtonText;

    const manifestTitle = document.querySelector(".manifest .section-title");
    const manifestText = document.querySelector(".manifest .manifest__content");
    const manifestButton = document.querySelector(".manifest .btn");
    if (manifestTitle && data.manifestTitle) manifestTitle.textContent = data.manifestTitle;
    if (manifestText && data.manifestText) manifestText.textContent = data.manifestText;
    if (manifestButton && data.manifestButtonText) manifestButton.textContent = data.manifestButtonText;

    const servicesTitle = document.querySelector(".services .section-title");
    if (servicesTitle && data.servicesTitle) servicesTitle.textContent = data.servicesTitle;

    const servicesIntro = document.querySelector(".services > .container > p");
    if (servicesIntro && data.servicesIntroText) servicesIntro.textContent = data.servicesIntroText;

    const serviceCards = document.querySelectorAll(".service__card");
    if (Array.isArray(data.servicesCards)) {
      data.servicesCards.forEach((card, index) => {
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

    const quoteText = document.querySelector(".quote__text");
    const quoteSignature = document.querySelector(".quote__signature p");
    if (quoteText && data.quoteText) quoteText.textContent = data.quoteText;
    if (quoteSignature && data.quoteSignature) quoteSignature.textContent = data.quoteSignature;

    const forWhomTitle = document.querySelector(".for-whom .section-title");
    if (forWhomTitle && data.forWhomTitle) forWhomTitle.textContent = data.forWhomTitle;
    if (Array.isArray(data.forWhomItems)) {
      const listItems = document.querySelectorAll(".for-whom .checklist li");
      data.forWhomItems.forEach((text, index) => {
        const li = listItems[index];
        if (!li || !text) return;
        const icon = li.querySelector("img");
        li.textContent = text;
        if (icon) li.prepend(icon);
      });
    }
    const forWhomButton = document.querySelector(".for-whom__action .button");
    if (forWhomButton && data.forWhomButtonText) forWhomButton.textContent = data.forWhomButtonText;

    const bottomText = document.querySelector(".psochazky__text p");
    if (bottomText && data.bottomText) bottomText.textContent = data.bottomText;
  } catch (error) {
    console.error("CMS home content load error:", error);
  }
})();
