
import SearchBar from "../components-JS/Browse/SearchBar.js";
import SortDropdown from "../components-JS/Browse/SortDropdown.js";
import Sidebar from "../components-JS/Browse/Sidebar.js";
import OfferGrid from "../components-JS/Browse/OfferGrid.js";
import Pagination from "../components-JS/Browse/Pagination.js";

document.addEventListener("DOMContentLoaded", () => {
  new SearchBar();
  new SortDropdown();
  new Sidebar();
  new OfferGrid();
  new Pagination();
});
