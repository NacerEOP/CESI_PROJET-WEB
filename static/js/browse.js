
import SearchBar from "../../src/js/components-JS/Browse/SearchBar.js";
import SortDropdown from "../../src/js/components-JS/Browse/SortDropdown.js";
import Sidebar from "../../src/js/components-JS/Browse/Sidebar.js";
import OfferGrid from "../../src/js/components-JS/Browse/OfferGrid.js";
import Pagination from "../../src/js/components-JS/Browse/Pagination.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Browse page initialized");

  new SearchBar();
  new SortDropdown();
  new Sidebar();
  new OfferGrid();
  new Pagination();
});
