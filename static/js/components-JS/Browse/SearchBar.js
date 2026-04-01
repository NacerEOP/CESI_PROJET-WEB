export default class SearchBar {
    constructor() {
        this.container = document.getElementById('search-bar');
        if (!this.container) {
            console.error('SearchBar: container #search-bar not found');
            return;
        }
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Search...';
        this.input.addEventListener('input', this.onSearch.bind(this));
        this.container.appendChild(this.input);
    }

    onSearch() {
        const query = this.input.value;
        const event = new CustomEvent('search', { detail: { query: query } });
        document.dispatchEvent(event);
    }
}