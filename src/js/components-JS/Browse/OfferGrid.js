
import OfferCard from "./OfferCard.js";

export default class OfferGrid {
  constructor() {
    this.container = document.getElementById("offers-grid");
    if (!this.container) {
      console.warn("OfferGrid: container not found");
      return;
    }

    this.render();
  }

  render() {
    this.container.innerHTML = "";

    const mockOffers = Array.from({ length: 15 }).map((_, i) => ({
      title: `Frontend Intern #${i + 1}`,
      company: "Creative Studio",
      location: "Remote"
    }));

    mockOffers.forEach(data => {
      const card = new OfferCard(data);
      this.container.appendChild(card.render());
    });
  }
}
