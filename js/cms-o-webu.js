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
      const h2 = blocks[0].querySelector("h2");
      const p = blocks[0].querySelectorAll("p")[1];
      if (h2 && data.firstHeading) h2.textContent = data.firstHeading;
      if (p && data.firstText) p.textContent = data.firstText;
    }

    if (blocks[1]) {
      const h2 = blocks[1].querySelector("h2");
      const p = blocks[1].querySelectorAll("p")[1];
      if (h2 && data.secondHeading) h2.textContent = data.secondHeading;
      if (p && data.secondText) p.textContent = data.secondText;
    }

    if (backButton && data.backButtonText) backButton.textContent = data.backButtonText;
  } catch (error) {
    console.error("CMS o-webu content load error:", error);
  }
})();
