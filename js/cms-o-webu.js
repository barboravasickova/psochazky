(async () => {
  try {
    const response = await fetch("data/o-webu-content.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();

    const root = document.querySelector(".page-content");
    if (!root) return;

    function splitHeading(heading) {
      const normalized = String(heading || "");
      const sep = normalized.includes(" – ") ? " – " : normalized.includes(" - ") ? " - " : null;
      if (!sep) return { prefix: normalized, name: "" };
      const idx = normalized.lastIndexOf(sep);
      return {
        prefix: normalized.slice(0, idx + sep.length),
        name: normalized.slice(idx + sep.length),
      };
    }

    function applyBlock(block, heading, text, linkUrl, linkAriaLabel) {
      if (!block) return;

      const headingEl = block.querySelector(".o-webu__heading-text");
      const p = block.querySelector("p");
      const iconLink = block.querySelector(".o-webu__social-link");

      if (headingEl && heading) {
        const { prefix, name } = splitHeading(heading);
        headingEl.textContent = "";

        if (name && linkUrl) {
          headingEl.appendChild(document.createTextNode(prefix));
          const nameLink = document.createElement("a");
          nameLink.href = linkUrl;
          nameLink.className = "o-webu__name-link";
          nameLink.target = "_blank";
          nameLink.rel = "noopener noreferrer";
          nameLink.textContent = name;
          headingEl.appendChild(nameLink);
        } else {
          headingEl.textContent = heading;
        }
      }

      if (p && text) p.textContent = text;

      if (iconLink && linkUrl) iconLink.href = linkUrl;
      if (iconLink && linkAriaLabel) iconLink.setAttribute("aria-label", linkAriaLabel);
    }

    const title = root.querySelector("h1");
    const blocks = root.querySelectorAll(".o-webu__item");
    const backButton = root.querySelector(".btn");

    if (title && data.title) title.textContent = data.title;

    applyBlock(blocks[0], data.firstHeading, data.firstText, data.firstLinkUrl, data.firstLinkAriaLabel);
    applyBlock(blocks[1], data.secondHeading, data.secondText, data.secondLinkUrl, data.secondLinkAriaLabel);

    if (backButton && data.backButtonText) backButton.textContent = data.backButtonText;
  } catch (error) {
    console.error("CMS o-webu content load error:", error);
  }
})();
