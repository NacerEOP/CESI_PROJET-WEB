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
            this.page = 1;
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
        document.addEventListener('dataReload', () => {
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
        const path = this.currentTab === 'internships' ? 'internships/search' : 'companies/search';
        const url = apiPath(path) + '?' + params.toString();
        try {
            const response = await fetch(url, { credentials: 'same-origin' });
            const result = await response.json();
            this.data = result.data || [];
            const event = new CustomEvent('dataLoaded', { detail: { totalPages: result.per_page ? Math.ceil(result.total / result.per_page) : 1 } });
            document.dispatchEvent(event);
            this.render();
        } catch (error) {
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
                    <button onclick="window.location.href='/internship/detail?id=${item.IdInternship}'">View Details</button>
                `;
            } else {
                const ratingHtml = item.average_rating ? `<p>Rating: ${'★'.repeat(Math.round(item.average_rating))} (${item.average_rating.toFixed(1)})</p>` : '<p>No ratings yet</p>';
                let buttons = `<button onclick="openCompanyModal(${item.IdCompany}, '${item.Name.replace(/'/g, "\\'")}')">View & Rate</button>`;
                if (window.user && ['admin', 'pilot'].includes(window.user.role)) {
                    buttons += ` <button onclick="companyEdit(${item.IdCompany})" style="margin-left: 5px;">Edit</button> <button onclick="companyDelete(${item.IdCompany})" style="margin-left: 5px;" class="danger">Delete</button>`;
                }
                card.innerHTML = `
                    <h4>${item.Name}</h4>
                    <p>${item.Description || 'No description'}</p>
                    <p>Country: ${item.CountryName}</p>
                    ${ratingHtml}
                    ${buttons}
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

window.viewInternship = async (id) => {
    const response = await fetch(apiPath('internships/detail') + '?id=' + id, { credentials: 'same-origin' });
    const data = await response.json();
    document.getElementById('internshipModalTitle').textContent = data.Title;
    let body = `<p>${data.Description}</p>
    <p>Company: ${data.CompanyName}</p>
    <p>Budget: €${data.Budget}</p>
    <p>Duration: ${data.Time_} weeks</p>`;
    if (window.user && window.user.role === 'student') {
        // Check if already applied
        const appResponse = await fetch(`/api/applications/check?internshipId=${id}`);
        const applied = await appResponse.json();
        if (!applied) {
            body += `<button onclick="applyToInternship(${id})">Apply</button>`;
        } else {
            body += '<p>You have already applied.</p>';
        }
    }
    document.getElementById('internshipModalBody').innerHTML = body;
    document.getElementById('internshipModal').style.display = 'flex';
};

window.viewCompany = (id) => {
    fetch(apiPath('companies/detail') + '?id=' + id, { credentials: 'same-origin' })
        .then(r => r.json())
        .then(data => {
            alert(`Details: ${JSON.stringify(data)}`);
        });
};