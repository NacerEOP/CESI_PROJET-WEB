export default class SearchBar {
    constructor() {
        this.container = document.getElementById('search-bar');
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Search...';
        this.input.addEventListener('input', this.onSearch.bind(this));
        this.container.appendChild(this.input);
    }

    onSearch() {
        // Trigger search
        const event = new CustomEvent('search', { detail: { query: this.input.value } });
        document.dispatchEvent(event);
    }
}