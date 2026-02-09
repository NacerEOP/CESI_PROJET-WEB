
import BrowsePage from '../pages-JS/browse.js';

class App {
  constructor() {
    const page = document.body.dataset.page;

    if (page === 'browse') {
      new BrowsePage();
    }
  }
}

new App();
