
export default class Sidebar {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);

    this.render();
    this.init();
  }

  render() {
    this.container.innerHTML = `
      <aside class="filters-sidebar collapsed">
        <div class="filters-tab">
          <span>Filters</span>
        </div>

        <div class="filters-content">
          <!-- filters later -->
        </div>
      </aside>
    `;
  }

  init() {
    this.sidebar = this.container.querySelector('.filters-sidebar');
    this.tab = this.container.querySelector('.filters-tab');

    this.tab.addEventListener('click', () => {
      this.sidebar.classList.toggle('active');
    });
  }
}
