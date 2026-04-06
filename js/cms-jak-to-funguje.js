(async () => {
  try {
    const response = await fetch("data/jak-to-funguje-content.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();

    const root = document.querySelector(".jak-page");
    if (!root) return;

    const title = root.querySelector("h1");
    const intro = root.querySelector(".page-content__intro");
    const sections = root.querySelectorAll(".jak-section h2");

    if (title && data.title) title.textContent = data.title;
    if (intro && data.intro) intro.textContent = data.intro;

    const sectionTitles = [
      data.section1Title,
      data.section2Title,
      data.section3Title,
      data.section4Title,
      data.section5Title,
      data.section6Title,
      data.section7Title
    ];

    sectionTitles.forEach((value, index) => {
      if (sections[index] && value) sections[index].textContent = value;
    });
  } catch (error) {
    console.error("CMS jak-to-funguje content load error:", error);
  }
})();
