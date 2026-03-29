export default class SortDropdown {
    constructor() {
        this.container = document.getElementById('sort-dropdown');
        this.select = document.createElement('select');
        this.select.innerHTML = `
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="title_asc">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
        `;
        this.select.addEventListener('change', this.onSort.bind(this));
        this.container.appendChild(this.select);
    }

    onSort() {
        const event = new CustomEvent('sort', { detail: { sort: this.select.value } });
        document.dispatchEvent(event);
    }
}