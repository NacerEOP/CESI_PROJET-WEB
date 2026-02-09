
export default class Pagination {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.currentPage = 5;
    this.totalPages = 20;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="pagination">
        <button class="prev">Previous</button>

        <button>1</button>
        <span class="dots">...</span>
        <button>${this.currentPage - 1}</button>
        <button class="active">${this.currentPage}</button>
        <button>${this.currentPage + 1}</button>
        <span class="dots">...</span>
        <button>${this.totalPages}</button>

        <button class="next">Next</button>
      </div>
    `;
  }
}
