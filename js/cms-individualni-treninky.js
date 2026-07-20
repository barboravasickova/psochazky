(async () => {
  try {
    const response = await fetch("data/individualni-treninky-content.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();

    const root = document.querySelector(".page-content--article");
    if (!root) return;

    const title = root.querySelector("h1");
    const h2List = root.querySelectorAll("h2");

    if (title && data.title) title.textContent = data.title;

    if (h2List[0] && data.section1Title) h2List[0].textContent = data.section1Title;
    if (h2List[1] && data.sectionExtraTitle) h2List[1].textContent = data.sectionExtraTitle;
    if (h2List[2] && data.section2Title) h2List[2].textContent = data.section2Title;
    if (h2List[3] && data.section3Title) h2List[3].textContent = data.section3Title;
    if (h2List[4] && data.section4Title) h2List[4].textContent = data.section4Title;
  } catch (error) {
    console.error("CMS individualni-treninky content load error:", error);
  }
})();
