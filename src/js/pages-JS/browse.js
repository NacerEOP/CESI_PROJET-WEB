
import SearchBar from '../components-JS/SearchBar.js';
import SortDropdown from '../components-JS/SortDropdown.js';
import Sidebar from '../components-JS/Sidebar.js';
import Pagination from '../components-JS/Pagination.js';

export default class BrowsePage {
  constructor() {
    new SearchBar('.search-slot');
    new SortDropdown('.sort-slot');
    new Sidebar('.filters-slot');
    new Pagination('.pagination-slot');
  }
}
