export default class Pagination {
    constructor() {
        this.container = document.getElementById('pagination');
        this.currentPage = 1;
        this.totalPages = 1;
        this.render();
        document.addEventListener('dataLoaded', (e) => {
            this.totalPages = e.detail.totalPages;
            this.render();
        });
    }

    render() {
        this.container.innerHTML = '';
        for (let i = 1; i <= this.totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.className = i === this.currentPage ? 'active' : '';
            button.addEventListener('click', () => {
                this.currentPage = i;
                const event = new CustomEvent('pageChange', { detail: { page: i } });
                document.dispatchEvent(event);
            });
            this.container.appendChild(button);
        }
    }
}