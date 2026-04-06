(async () => {
  try {
    const root = document.getElementById("cms-kontakt-root");
    if (!root || !window.CmsBlocks) return;
    const response = await fetch("data/kontakt-content.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data.blocks)) {
      root.innerHTML = window.CmsBlocks.renderBlocks(data.blocks);
    }
  } catch (error) {
    console.error("CMS kontakt content load error:", error);
  }
})();
