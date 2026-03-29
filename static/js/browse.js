
import SearchBar from "./components-JS/Browse/SearchBar.js";
import SortDropdown from "./components-JS/Browse/SortDropdown.js";
import Sidebar from "./components-JS/Browse/Sidebar.js";
import OfferGrid from "./components-JS/Browse/OfferGrid.js";
import Pagination from "./components-JS/Browse/Pagination.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Browse page initialized");

  let currentTab = 'internships';

  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentTab = button.dataset.tab;
      window.currentTab = currentTab;
      const event = new CustomEvent('tabChange', { detail: { tab: currentTab } });
      document.dispatchEvent(event);
      // Show add company button only for companies tab
      const addBtn = document.getElementById('add-company-btn');
      if (addBtn) {
        addBtn.style.display = currentTab === 'companies' ? 'block' : 'none';
      }
    });
  });

  new SearchBar();
  new SortDropdown();
  new Sidebar();
  new OfferGrid();
  new Pagination();
});
