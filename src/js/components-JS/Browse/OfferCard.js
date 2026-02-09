
export default class OfferCard {
  constructor(data) {
    this.data = data;
  }

  render() {
    const card = document.createElement('div');
    card.className = 'offer-card';

    card.innerHTML = `
      <h3>${this.data.title}</h3>
      <p class="company">${this.data.company}</p>
      <p class="location">${this.data.location}</p>
    `;

    card.addEventListener('click', () => {
      window.location.href = 'internship.html';
    });

    return card;
  }
}
