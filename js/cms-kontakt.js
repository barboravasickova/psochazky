(async () => {
  try {
    const response = await fetch("data/kontakt-content.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();

    const root = document.querySelector(".page-content");
    if (!root) return;

    const title = root.querySelector("h1");
    const intro = root.querySelector("h1 + p");
    const contactRows = root.querySelectorAll("ul[style*='list-style: none'] li div + div");
    const h2List = root.querySelectorAll("h2");

    if (title && data.title) title.textContent = data.title;
    if (intro && data.intro) intro.textContent = data.intro;

    if (contactRows[0] && data.messengerText) {
      contactRows[0].innerHTML = `<a href="https://m.me/psochazky" target="_blank" rel="noopener noreferrer">${data.messengerText}</a>`;
    }
    if (contactRows[1] && data.emailText) {
      contactRows[1].innerHTML = `<a href="mailto:psochazky@gmail.com">${data.emailText}</a>`;
    }
    if (contactRows[2] && data.locationText) {
      contactRows[2].textContent = data.locationText;
    }

    if (h2List[0] && data.bookingTitle) h2List[0].textContent = data.bookingTitle;
    if (h2List[1] && data.individualTitle) h2List[1].textContent = data.individualTitle;
    if (h2List[2] && data.cooperationTitle) h2List[2].textContent = data.cooperationTitle;
  } catch (error) {
    console.error("CMS kontakt content load error:", error);
  }
})();
