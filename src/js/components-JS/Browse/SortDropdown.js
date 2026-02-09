
export default class SortDropdown {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.current = 'Relevance';

    this.render();
    this.init();
  }

  render() {
    this.container.innerHTML = `
      <div class="sort-dropdown">
        <button class="sort-button">
          Sort By : <span class="current-sort">${this.current}</span>
        </button>

        <ul class="sort-menu hidden">
          <li data-sort="relevance">Relevance</li>
          <li data-sort="salary-asc">Salary ↑</li>
          <li data-sort="salary-desc">Salary ↓</li>
          <li data-sort="date-desc">Newest</li>
          <li data-sort="date-asc">Oldest</li>
          <li data-sort="distance-asc">Nearest</li>
          <li data-sort="distance-desc">Farthest</li>
        </ul>
      </div>
    `;
  }

  init() {
    this.button = this.container.querySelector('.sort-button');
    this.menu = this.container.querySelector('.sort-menu');
    this.label = this.container.querySelector('.current-sort');

    this.button.addEventListener('click', () => {
      this.menu.classList.toggle('hidden');
    });

    this.menu.querySelectorAll('li').forEach(item => {
      item.addEventListener('click', () => {
        this.label.textContent = item.textContent;
        this.menu.classList.add('hidden');
      });
    });
  }
}
