(async () => {
  try {
    const response = await fetch("data/o-webu-content.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();

    const root = document.querySelector(".page-content");
    if (!root) return;

    const title = root.querySelector("h1");
    const blocks = root.querySelectorAll(".o-webu__item");
    const backButton = root.querySelector(".btn");

    if (title && data.title) title.textContent = data.title;

    if (blocks[0]) {
      const headingText = blocks[0].querySelector(".o-webu__heading-text");
      const p = blocks[0].querySelector("p");
      if (headingText && data.firstHeading) headingText.textContent = data.firstHeading;
      if (p && data.firstText) p.textContent = data.firstText;
    }

    if (blocks[1]) {
      const headingText = blocks[1].querySelector(".o-webu__heading-text");
      const p = blocks[1].querySelector("p");
      if (headingText && data.secondHeading) headingText.textContent = data.secondHeading;
      if (p && data.secondText) p.textContent = data.secondText;
    }

    if (backButton && data.backButtonText) backButton.textContent = data.backButtonText;
  } catch (error) {
    console.error("CMS o-webu content load error:", error);
  }
})();
