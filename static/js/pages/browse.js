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

  // Hamburger menu toggle
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      sidebarToggle.classList.toggle('open');
    });
    
    // Close sidebar when clicking on the overlay
    sidebar.addEventListener('click', (e) => {
      if (e.target === sidebar) {
        sidebar.classList.remove('open');
        sidebarToggle.classList.remove('open');
      }
    });
  }

  new SearchBar();
  new SortDropdown();
  new Sidebar();
  new OfferGrid();
  new Pagination();
});

// Modal functions
// (Removed internship modals, now using dedicated page)

function apiPath(path) {
    const baseUrl = (window.APP_BASE_URL || '').replace(/\/+$/, '');
    const prefix = baseUrl.length ? baseUrl + '/api' : '/api';
    const cleaned = path.toString().replace(/^\/+/, '');
    return prefix.replace(/\/+$/, '') + '/' + cleaned;
}

function updateStarDisplay() {
    const ratingValue = document.getElementById('ratingValue');
    if (!ratingValue) return;
    
    const rating = parseInt(ratingValue.value || 0, 10);
    const stars = document.querySelectorAll('#ratingStars .star');
    
    stars.forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'), 10);
        star.style.color = starRating <= rating ? '#ffc107' : '#ddd';
    });
}

function attachStarClickHandlers() {
    const stars = document.querySelectorAll('#ratingStars .star');
    const ratingValue = document.getElementById('ratingValue');
    
    if (!stars.length || !ratingValue) return;
    
    stars.forEach(star => {
        // Remove old listener by cloning (prevent duplicates)
        const newStar = star.cloneNode(true);
        star.replaceWith(newStar);
    });
    
    // Re-query after replacing
    document.querySelectorAll('#ratingStars .star').forEach(star => {
        star.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const rating = parseInt(this.getAttribute('data-rating'), 10);
            document.getElementById('ratingValue').value = rating;
            updateStarDisplay();
        }, false);
        
        star.addEventListener('mouseover', function() {
            const hoverRating = parseInt(this.getAttribute('data-rating'), 10);
            document.querySelectorAll('#ratingStars .star').forEach(s => {
                const starNum = parseInt(s.getAttribute('data-rating'), 10);
                s.style.color = starNum <= hoverRating ? '#ffc107' : '#ddd';
            });
        }, false);
    });
    
    document.getElementById('ratingStars').addEventListener('mouseout', function() {
        updateStarDisplay();
    }, false);
    
    updateStarDisplay();
}

function submitRating() {
    const companyId = document.getElementById('modalCompanyId').value;
    const rating = parseInt(document.getElementById('ratingValue').value, 10);
    const ratingText = document.getElementById('ratingText').value.trim();
    
    if (!companyId || rating < 1 || rating > 5) {
        alert('Please select a rating between 1 and 5.');
        return false;
    }
    
    const params = new URLSearchParams();
    params.append('companyId', companyId);
    params.append('rating', rating);
    params.append('ratingText', ratingText);
    
    console.log('Submitting rating:', { companyId, rating, ratingText });
    
    fetch(apiPath('companies/rate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    })
    .then(r => {
        console.log('Response status:', r.status);
        return r.json();
    })
    .then(result => {
        console.log('Response data:', result);
        if (result.message || result.success) {
            alert('Rating submitted successfully!');
            loadCompanyRatings(companyId);
        } else {
            alert('Error: ' + (result.error || 'Failed to save rating'));    
        }
    })
    .catch(error => {
        console.error('Error submitting rating:', error);
        alert('Error: ' + error.message);
    });
    
    return false;
}

function loadCompanyRatings(companyId) {
    const ratingSection = document.getElementById('companyRatingSection');
    const ratingForm = document.getElementById('ratingForm');
    const ratingFormPlaceholder = document.getElementById('ratingFormPlaceholder');

    document.getElementById('modalCompanyId').value = companyId;

    fetch(apiPath(`companies/ratings?companyId=${encodeURIComponent(companyId)}`))
        .then(response => response.json())
        .then(data => {
            console.log('Loaded ratings:', data);
            if (!ratingSection) return;

            let html = '<div class="company-rating-display">';
            if (data.averageRating !== null && data.averageRating !== undefined) {
                html += `<h3>Company Rating</h3><div class="rating-stars">${'★'.repeat(Math.round(data.averageRating))}${'☆'.repeat(5 - Math.round(data.averageRating))}</div><p>Average ${data.averageRating.toFixed(1)} from ${data.ratingCount || 0} reviews</p>`;
            } else {
                html += '<h3>Company Rating</h3><p>No ratings yet</p>';
            }
            html += '</div>';

            if (Array.isArray(data.ratings) && data.ratings.length > 0) {
                html += '<div class="rating-list">';
                data.ratings.forEach(r => {
                    const stars = '★'.repeat(r.Rating) + '☆'.repeat(5 - r.Rating);
                    html += `<div class="rating-item"><div class="rating-header"><strong>${r.FirstName} ${r.LastName}</strong> <span class="rating-user-badge">${r.UserRole}</span></div><div class="rating-stars">${stars}</div><p>${r.RatingText || ''}</p></div>`;
                });
                html += '</div>';
            }

            ratingSection.innerHTML = html;

            if (ratingForm) {
                const user = window.USER_DATA;
                console.log('Current user:', user);
                
                if (user && user.role && ['admin', 'pilot'].includes(user.role)) {
                    console.log('User is admin/pilot, showing form');
                    ratingForm.style.display = 'block';
                    if (ratingFormPlaceholder) ratingFormPlaceholder.style.display = 'none';

                    if (data.userRating) {
                        document.getElementById('ratingValue').value = data.userRating.Rating;
                        document.getElementById('ratingText').value = data.userRating.RatingText || '';
                    } else {
                        document.getElementById('ratingValue').value = 0;
                        document.getElementById('ratingText').value = '';
                    }
                    
                    // Attach handlers after form is visible
                    setTimeout(() => {
                        attachStarClickHandlers();
                    }, 50);
                } else {
                    console.log('User not authorized to rate');
                    ratingForm.style.display = 'none';
                    if (ratingFormPlaceholder) ratingFormPlaceholder.style.display = 'block';
                }
            }
        })
        .catch(error => {
            console.error('Error loading ratings', error);
            if (ratingSection) {
                ratingSection.innerHTML = '<p class="text-danger">Failed to load ratings</p>';
            }
        });
}

function openCompanyModal(companyId, companyName) {
    document.getElementById('modalTitle').textContent = companyName;
    document.getElementById('companyModal').style.display = 'block';
    loadCompanyRatings(companyId);
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

// Rating stars and submit functionality
function attachRatingFormListener() {
    const ratingForm = document.getElementById('ratingForm');
    if (!ratingForm) return;

    // Remove old listener by cloning
    const newForm = ratingForm.cloneNode(true);
    ratingForm.parentNode.replaceChild(newForm, ratingForm);

    const form = document.getElementById('ratingForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const companyId = document.getElementById('modalCompanyId').value;
        const rating = parseInt(document.getElementById('ratingValue').value, 10);
        const ratingText = document.getElementById('ratingText').value.trim();

        if (!companyId || rating < 1 || rating > 5) {
            alert('Please select a rating between 1 and 5.');
            return;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('companyId', companyId);
            formData.append('rating', rating);
            formData.append('ratingText', ratingText);

            fetch(apiPath('companies/rate'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            })
            .then(response => response.json())
            .then(result => {
                if (result.message || result.success) {
                    alert('Rating submitted successfully!');
                    loadCompanyRatings(companyId);
                } else {
                    alert('Error: ' + (result.error || 'Failed to save rating'));    
                }
            })
            .catch(error => {
                console.error('Error submitting rating:', error);
                alert('Error submitting rating: ' + error.message);
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        }
    }, true);
}

function setupRatingActions() {
    const user = window.USER_DATA;
    if (!user || !user.role || !['admin', 'pilot'].includes(user.role)) {
        console.log('User not authorized for ratings');
        return;
    }
    console.log('Rating system initialized for user:', user);
}

document.addEventListener('DOMContentLoaded', () => {
    window.USER_DATA = document.getElementById('user-data') ? JSON.parse(document.getElementById('user-data').textContent || '{}') : null;
    console.log('USER_DATA loaded:', window.USER_DATA);
    setupRatingActions();
    
    // Attach form submit handler
    const ratingForm = document.getElementById('ratingForm');
    if (ratingForm) {
        ratingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            submitRating();
            return false;
        }, true);
    }
});
