(async () => {
  try {
    const response = await fetch("data/o-mne-content.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();

    const title = document.querySelector(".page-content h1");
    const intro = document.querySelector(".page-content__intro");
    const sectionTitles = document.querySelectorAll(".page-content h2");
    const quote = document.querySelector(".quote-bubble__text");

    if (title && data.title) title.textContent = data.title;
    if (intro && data.intro) intro.textContent = data.intro;

    const headingValues = [data.section1Title, data.section2Title, data.section3Title, data.section4Title];
    headingValues.forEach((value, index) => {
      if (sectionTitles[index] && value) sectionTitles[index].textContent = value;
    });

    if (quote && data.quote) quote.innerHTML = data.quote.replace(/\n/g, "<br>");
  } catch (error) {
    console.error("CMS o-mne content load error:", error);
  }
})();
