
export default class SearchBar {
  constructor() {
    this.container = document.getElementById("search-bar");
    if (!this.container) {
      console.warn("SearchBar: container not found");
      return;
    }

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="search-bar-wrapper">
        <button class="advanced-search-btn" aria-label="Advanced filters">
          ⚙
        </button>

        <input
          type="text"
          class="search-input"
          placeholder="Search for a Specific Internship..."
        />

        <button class="search-btn" aria-label="Search">
          🔍
        </button>
      </div>

      <div class="advanced-search-panel hidden"></div>
    `;
  }

  bindEvents() {
    const input = this.container.querySelector(".search-input");
    const searchBtn = this.container.querySelector(".search-btn");

    searchBtn.addEventListener("click", () => {
      console.log("Search:", input.value);
    });
  }
}
