(async () => {
  try {
    const response = await fetch("data/vylety-a-akce-content.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();

    const root = document.querySelector(".page-content--article");
    if (!root) return;

    const title = root.querySelector("h1");
    const h2List = root.querySelectorAll("h2");

    if (title && data.title) title.textContent = data.title;

    if (h2List[0] && data.section1Title) h2List[0].textContent = data.section1Title;
    if (h2List[1] && data.section2Title) h2List[1].textContent = data.section2Title;
  } catch (error) {
    console.error("CMS vylety-a-akce content load error:", error);
  }
})();
