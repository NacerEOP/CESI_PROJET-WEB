
export default class SearchBar {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.text = 'Search for a Specific Internship...';
    this.index = 0;

    this.render();
    this.init();
  }

  render() {
    this.container.innerHTML = `
      <div class="search-bar">
        <button class="advanced-search-toggle">⚙</button>
        <input class="search-input" type="text" placeholder="" />
        <button class="search-submit">🔍</button>
      </div>

      <div class="advanced-search-panel hidden">
        <!-- Advanced filters later -->
      </div>
    `;
  }

  init() {
    this.input = this.container.querySelector('.search-input');
    this.toggle = this.container.querySelector('.advanced-search-toggle');

    this.typePlaceholder();
    this.toggle.addEventListener('click', () => this.toggleAdvanced());
  }

  typePlaceholder() {
    if (this.index < this.text.length) {
      this.input.placeholder += this.text[this.index++];
      setTimeout(() => this.typePlaceholder(), 40);
    }
  }

  toggleAdvanced() {
    const panel = this.container.querySelector('.advanced-search-panel');
    panel.classList.toggle('hidden');
  }
}
