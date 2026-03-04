
export default class Pagination {
  constructor() {
    this.container = document.getElementById("pagination");
    if (!this.container) {
      console.warn("Pagination: container not found");
      return;
    }

    this.currentPage = 3;
    this.totalPages = 10;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <button class="prev-btn">Previous</button>

      <button>1</button>
      <span class="dots">...</span>
      <button>2</button>
      <button class="active">${this.currentPage}</button>
      <button>4</button>
      <span class="dots">...</span>
      <button>${this.totalPages}</button>

      <button class="next-btn">Next</button>
    `;
  }
}
