
export default class Sidebar {
  constructor() {
    this.container = document.getElementById("sidebar");
    if (!this.container) {
      console.warn("Sidebar: container not found");
      return;
    }

    this.isOpen = false;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="sidebar-handle">
        <span class="sidebar-icon">≡</span>
        <span class="sidebar-label">Filters</span>
      </div>

      <div class="sidebar-content hidden">
        <h3>Filters</h3>
        <!-- future filters -->
      </div>
    `;
  }

  bindEvents() {
    const handle = this.container.querySelector(".sidebar-handle");
    const content = this.container.querySelector(".sidebar-content");

    handle.addEventListener("click", () => {
      this.isOpen = !this.isOpen;
      content.classList.toggle("hidden", !this.isOpen);
      this.container.classList.toggle("open", this.isOpen);
    });
  }
}
