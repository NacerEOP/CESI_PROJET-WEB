export default class OfferGrid {
    constructor() {
        this.container = document.getElementById('offers-grid');
        this.currentTab = 'internships';
        this.data = [];
        this.page = 1;
        this.query = '';
        this.filters = {};
        this.sort = '';
        this.loadData();
        document.addEventListener('tabChange', (e) => {
            this.currentTab = e.detail.tab;
            this.loadData();
        });
        document.addEventListener('search', (e) => {
            this.query = e.detail.query;
            this.loadData();
        });
        document.addEventListener('filter', (e) => {
            this.filters = e.detail.filters;
            this.loadData();
        });
        document.addEventListener('sort', (e) => {
            this.sort = e.detail.sort;
            this.loadData();
        });
        document.addEventListener('pageChange', (e) => {
            this.page = e.detail.page;
            this.loadData();
        });
    }

    async loadData() {
        const params = new URLSearchParams();
        params.set('page', this.page);
        if (this.query) params.set('q', this.query);
        if (this.sort) params.set('sort', this.sort);
        for (const [key, value] of Object.entries(this.filters)) {
            if (Array.isArray(value)) {
                value.forEach(v => params.append(key, v));
            } else if (value) {
                params.set(key, value);
            }
        }
        const url = this.currentTab === 'internships' ? `/api/internships/search?${params}` : `/api/companies/search?${params}`;
        try {
            const response = await fetch(url);
            const result = await response.json();
            this.data = result.data || [];
            const event = new CustomEvent('dataLoaded', { detail: { totalPages: result.per_page ? Math.ceil(result.total / result.per_page) : 1 } });
            document.dispatchEvent(event);
            this.render();
        } catch (error) {
            console.error('Error loading data:', error);
            this.data = [];
            this.render();
        }
    }

    render() {
        this.container.innerHTML = '';
        this.data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            if (this.currentTab === 'internships') {
                card.innerHTML = `
                    <h4>${item.Title}</h4>
                    <p>${item.Description}</p>
                    <p>Company: ${item.CompanyName}</p>
                    <p>Budget: ${item.Budget}</p>
                    <button onclick="viewInternship(${item.IdInternship})">View Details</button>
                `;
            } else {
                card.innerHTML = `
                    <h4>${item.Name}</h4>
                    <p>${item.Description}</p>
                    <p>Country: ${item.CountryName}</p>
                    <button onclick="viewCompany(${item.IdCompany})">View Details</button>
                `;
            }
            this.container.appendChild(card);
        });
        // Update results count
        const countEl = document.getElementById('results-count');
        if (countEl) {
            countEl.textContent = `Showing ${this.data.length} results`;
        }
    }
}

window.viewInternship = (id) => {
    // Open modal or redirect
    fetch(`/api/internships/detail?id=${id}`)
        .then(r => r.json())
        .then(data => {
            alert(`Details: ${JSON.stringify(data)}`);
        });
};

window.viewCompany = (id) => {
    fetch(`/api/companies/detail?id=${id}`)
        .then(r => r.json())
        .then(data => {
            alert(`Details: ${JSON.stringify(data)}`);
        });
};