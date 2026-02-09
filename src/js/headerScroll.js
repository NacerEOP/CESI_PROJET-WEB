
class HeaderScroll {
  constructor() {
    this.header = document.querySelector('.main-header');
    this.lastScroll = 0;

    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.onScroll());
  }

  onScroll() {
    const currentScroll = window.scrollY;

    if (currentScroll > this.lastScroll && currentScroll > 100) {
      // scroll vers le bas
      this.header.classList.add('hidden');
    } else {
      // scroll vers le haut
      this.header.classList.remove('hidden');
    }

    this.lastScroll = currentScroll;
  }
}

new HeaderScroll();

