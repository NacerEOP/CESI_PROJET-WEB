export default class Sidebar {
    constructor() {
        this.container = document.getElementById('sidebar');
        this.currentTab = 'internships';
        this.render();
        document.addEventListener('tabChange', (e) => {
            this.currentTab = e.detail.tab;
            this.render();
        });
    }

    render() {
        this.container.innerHTML = '';
        if (this.currentTab === 'internships') {
            this.renderInternshipFilters();
        } else {
            this.renderCompanyFilters();
        }
    }

    renderInternshipFilters() {
        this.container.innerHTML = `
            <h3>Filters</h3>
            <div>
                <label>Skills:</label>
                <input type="text" id="skills-filter" placeholder="e.g., JavaScript, Python">
            </div>
            <div>
                <label>Category:</label>
                <select id="category-filter">
                    <option value="">All</option>
                    <!-- Add categories dynamically -->
                </select>
            </div>
            <div>
                <label>Budget Min:</label>
                <input type="number" id="budget-min">
            </div>
            <div>
                <label>Budget Max:</label>
                <input type="number" id="budget-max">
            </div>
            <button id="apply-filters">Apply</button>
        `;
        document.getElementById('apply-filters').addEventListener('click', this.applyFilters.bind(this));
    }

    renderCompanyFilters() {
        this.container.innerHTML = `
            <h3>Filters</h3>
            <div>
                <label>Country:</label>
                <select id="country-filter">
                    <option value="">All</option>
                    <!-- Add countries dynamically -->
                </select>
            </div>
            <button id="apply-filters">Apply</button>
        `;
        document.getElementById('apply-filters').addEventListener('click', this.applyFilters.bind(this));
    }

    applyFilters() {
        const filters = {};
        if (this.currentTab === 'internships') {
            filters.skills = document.getElementById('skills-filter').value.split(',').map(s => s.trim()).filter(s => s);
            filters.category = document.getElementById('category-filter').value;
            filters.budget_min = document.getElementById('budget-min').value;
            filters.budget_max = document.getElementById('budget-max').value;
        } else {
            filters.country = document.getElementById('country-filter').value;
        }
        const event = new CustomEvent('filter', { detail: { filters } });
        document.dispatchEvent(event);
    }
}