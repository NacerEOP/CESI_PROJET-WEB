import SearchBar from "../components-JS/Browse/SearchBar.js";
import SortDropdown from "../components-JS/Browse/SortDropdown.js";
import Sidebar from "../components-JS/Browse/Sidebar.js";
import OfferGrid from "../components-JS/Browse/OfferGrid.js";
import Pagination from "../components-JS/Browse/Pagination.js";

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

// Modal functions
// (Removed internship modals, now using dedicated page)

function openCompanyModal(companyId, companyName) {
    document.getElementById('modalTitle').textContent = companyName;
    
    // Fetch company details
    fetch(`/api/companies/detail?id=${companyId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error loading company details:', data.error);
                return;
            }
            // Populate modal with details
            const ratingSection = document.getElementById('companyRatingSection');
            if (data.avg_rating) {
                ratingSection.innerHTML = `
                    <div class="company-rating-display">
                        <h3>Company Rating</h3>
                        <div class="rating-stars">${'★'.repeat(Math.round(data.avg_rating))} (${data.avg_rating.toFixed(1)})</div>
                        <p>Based on ${data.rating_count || 0} reviews</p>
                    </div>
                `;
            } else {
                ratingSection.innerHTML = '<p>No ratings yet</p>';
            }
            
            // Set the company ID for rating form
            document.getElementById('modalCompanyId').value = companyId;
            
            document.getElementById('companyModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading company details:', error);
        });
}

function closeCompanyModal() {
    document.getElementById('companyModal').style.display = 'none';
}

function openCreateCompanyModal() {
    document.getElementById('createCompanyModal').style.display = 'block';
}

function closeCreateCompanyModal() {
    document.getElementById('createCompanyModal').style.display = 'none';
}

function openEditCompanyModal() {
    document.getElementById('editCompanyModal').style.display = 'block';
}

function closeEditCompanyModal() {
    document.getElementById('editCompanyModal').style.display = 'none';
}

// Rating stars functionality
document.addEventListener('DOMContentLoaded', () => {
    const ratingStars = document.getElementById('ratingStars');
    if (ratingStars) {
        const stars = ratingStars.querySelectorAll('.star');
        const ratingValue = document.getElementById('ratingValue');
        
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                ratingValue.value = rating;
                
                stars.forEach(s => {
                    if (parseInt(s.dataset.rating) <= rating) {
                        s.classList.add('selected');
                    } else {
                        s.classList.remove('selected');
                    }
                });
            });
        });
    }

    // Rating form submission
    const ratingForm = document.getElementById('ratingForm');
    if (ratingForm) {
        ratingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(ratingForm);
            const data = {
                companyId: formData.get('companyId'),
                rating: formData.get('rating'),
                ratingText: formData.get('ratingText')
            };

            try {
                const response = await fetch('/api/companies/rate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                if (result.success) {
                    alert('Rating submitted successfully!');
                    closeCompanyModal();
                    // Reload the page or update the grid
                    location.reload();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                console.error('Error submitting rating:', error);
                alert('Error submitting rating');
            }
        });
    }
});
