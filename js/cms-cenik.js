(async () => {
  try {
    const response = await fetch("data/cenik-content.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();

    const page = document.querySelector(".cenik");
    if (!page) return;

    const title = page.querySelector("h1");
    if (title && data.title) title.textContent = data.title;

    const introItems = page.querySelectorAll(".cenik__intro p");
    if (introItems[0] && data.intro1) introItems[0].textContent = data.intro1;
    if (introItems[1] && data.intro2) introItems[1].textContent = data.intro2;

    const walksTitle = page.querySelector("#cenik-prochazky");
    const individualTitle = page.querySelector("#cenik-individual");
    const tripTitle = page.querySelector("#cenik-vylet");
    const paymentsTitle = page.querySelector("#cenik-platby");
    if (walksTitle && data.sectionWalksTitle) walksTitle.textContent = data.sectionWalksTitle;
    if (individualTitle && data.sectionIndividualTitle) individualTitle.textContent = data.sectionIndividualTitle;
    if (tripTitle && data.sectionTripTitle) tripTitle.textContent = data.sectionTripTitle;
    if (paymentsTitle && data.sectionPaymentsTitle) paymentsTitle.textContent = data.sectionPaymentsTitle;

    const quote = page.querySelector(".quote-bubble__text");
    if (quote && data.quote) quote.innerHTML = data.quote.replace(/\n/g, "<br>");

    const paymentItems = page.querySelectorAll(".cenik__payments ul li");
    if (Array.isArray(data.paymentItems)) {
      data.paymentItems.forEach((text, index) => {
        if (paymentItems[index] && text) paymentItems[index].textContent = text;
      });
    }

    const paymentNote = page.querySelector(".cenik__payments-note");
    if (paymentNote && data.paymentNote) paymentNote.textContent = data.paymentNote;

    const ctaButtons = page.querySelectorAll(".page-content__cta .btn");
    if (Array.isArray(data.ctaButtons)) {
      data.ctaButtons.forEach((button, index) => {
        if (ctaButtons[index] && button && button.text) ctaButtons[index].textContent = button.text;
      });
    }
  } catch (error) {
    console.error("CMS cenik content load error:", error);
  }
})();
