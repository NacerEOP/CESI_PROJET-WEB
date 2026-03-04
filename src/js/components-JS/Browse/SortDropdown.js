
export default class SortDropdown {
  constructor() {
    this.container = document.getElementById("sort-dropdown");
    if (!this.container) {
      console.warn("SortDropdown: container not found");
      return;
    }

    this.isOpen = false;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="sort-dropdown">
        <button class="sort-toggle">
          Sort By : <span class="current-sort">Relevance</span>
        </button>

        <ul class="sort-menu hidden">
          <li data-sort="relevance">Relevance</li>
          <li data-sort="salary-asc">Salary ↑</li>
          <li data-sort="salary-desc">Salary ↓</li>
          <li data-sort="date-desc">Newest</li>
          <li data-sort="date-asc">Oldest</li>
          <li data-sort="distance-asc">Closest</li>
          <li data-sort="distance-desc">Farthest</li>
        </ul>
      </div>
    `;
  }

  bindEvents() {
    const toggle = this.container.querySelector(".sort-toggle");
    const menu = this.container.querySelector(".sort-menu");
    const current = this.container.querySelector(".current-sort");

    toggle.addEventListener("click", () => {
      this.isOpen = !this.isOpen;
      menu.classList.toggle("hidden", !this.isOpen);
    });

    menu.querySelectorAll("li").forEach(item => {
      item.addEventListener("click", () => {
        current.textContent = item.textContent;
        this.isOpen = false;
        menu.classList.add("hidden");

        console.log("Sort selected:", item.dataset.sort);
      });
    });
  }
}
