(async () => {
  try {
    const response = await fetch("data/dalsi-sluzby-content.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();

    const root = document.querySelector(".page-content--article");
    if (!root) return;

    const title = root.querySelector("h1");
    const lead = root.querySelector(".dalsi-sluzby__lead");
    const h2List = root.querySelectorAll("h2");
    const h3List = root.querySelectorAll("h3");

    if (title && data.title) title.textContent = data.title;
    if (lead && data.lead) lead.textContent = data.lead;

    if (h2List[0] && data.section1Title) h2List[0].textContent = data.section1Title;
    if (h3List[0] && data.section2Title) h3List[0].textContent = data.section2Title;
    if (h3List[1] && data.section3Title) h3List[1].textContent = data.section3Title;
    if (h2List[1] && data.section4Title) h2List[1].textContent = data.section4Title;
    if (h2List[2] && data.section5Title) h2List[2].textContent = data.section5Title;
    if (h2List[3] && data.section6Title) h2List[3].textContent = data.section6Title;
  } catch (error) {
    console.error("CMS dalsi-sluzby content load error:", error);
  }
})();
