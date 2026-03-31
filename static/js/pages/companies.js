let currentCompanyId = null;

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openCompanyModal(companyId, companyName) {
    currentCompanyId = companyId;
    const title = document.getElementById('modalTitle');
    const hidden = document.getElementById('modalCompanyId');
    if (title) title.textContent = companyName;
    if (hidden) hidden.value = companyId;
    const modal = document.getElementById('companyModal');
    if (modal) modal.classList.add('show');
    loadCompanyRatings(companyId);
}

function closeCompanyModal() {
    const modal = document.getElementById('companyModal');
    if (modal) modal.classList.remove('show');
    currentCompanyId = null;
}

function apiPath(path) {
    if (typeof window.APP_API_URL === 'string' && window.APP_API_URL.length) {
        const cleaned = path.toString().replace(/^\/+/, '');
        return window.APP_API_URL.replace(/\/+$/, '') + '/' + cleaned;
    }
    const baseUrl = (window.APP_BASE_URL || '').replace(/\/+$/, '');
    const prefix = baseUrl.length ? baseUrl + '/api' : '/api';
    const cleaned = path.toString().replace(/^\/+/, '');
    return prefix.replace(/\/+$/, '') + '/' + cleaned;
}

function loadCompanyRatings(companyId) {
    const url = apiPath('companies/ratings?companyId=' + encodeURIComponent(companyId));
    fetch(url)
        .then(r => { if (!r.ok) throw new Error('Failed to load ratings: ' + r.statusText); return r.json(); })
        .then(data => {
            const section = document.getElementById('companyRatingSection');
            if (!section) return;
            let html = '<div class="company-rating-section"><h3>Evaluations</h3>';

            if (data.averageRating) {
                const stars = '★'.repeat(Math.round(data.averageRating)) + '☆'.repeat(5 - Math.round(data.averageRating));
                html += `<div style="text-align: center; margin-bottom: var(--spacing-lg);"><div class="avg-rating">${data.averageRating.toFixed(1)}</div><div>${stars}</div><div class="rating-count">${data.ratingCount} evaluation${data.ratingCount !== 1 ? 's' : ''}</div></div>`;
            } else {
                html += '<p style="text-align: center; color: var(--text-light); padding: var(--spacing-md);">No evaluations yet</p>';
            }

            if (Array.isArray(data.ratings) && data.ratings.length > 0) {
                html += '<div style="margin-top: var(--spacing-lg); border-top: 1px solid var(--border-color); padding-top: var(--spacing-lg);"><h4 style="margin-top: 0;">Recent Evaluations</h4>';
                data.ratings.forEach(rating => {
                    const stars = '★'.repeat(rating.Rating) + '☆'.repeat(5 - rating.Rating);
                    html += `<div class="rating-item"><div class="rating-header"><div><strong>${rating.FirstName} ${rating.LastName}</strong><span class="rating-user-badge">${rating.UserRole}</span></div><div style="text-align: right;"><div style="font-size: 18px; color: #ffc107;">${stars}</div></div></div>`;
                    if (rating.RatingText) {
                        html += `<p style="margin: var(--spacing-sm) 0; color: var(--text-dark);">${escapeHtml(rating.RatingText)}</p>`;
                    }
                    html += '</div>';
                });
                html += '</div>';
            }

            html += '</div>';
            section.innerHTML = html;

            const form = document.getElementById('ratingForm');
            if (form) {
                form.style.display = 'block';
                const placeholder = document.getElementById('ratingFormPlaceholder');
                if (placeholder) placeholder.style.display = 'none';

                if (data.userRating) {
                    const ratingValue = document.getElementById('ratingValue');
                    const ratingText = document.getElementById('ratingText');
                    if (ratingValue) ratingValue.value = data.userRating.Rating;
                    if (ratingText) ratingText.value = data.userRating.RatingText || '';
                    updateStarDisplay();
                }
            }
        })
        .catch(err => { const sec = document.getElementById('companyRatingSection'); if (sec) sec.innerHTML = `<div class="alert danger">Error loading ratings: ${err.message}</div>`; });
}

function updateStarDisplay() {
    const rating = parseInt(document.getElementById('ratingValue').value || 0);
    document.querySelectorAll('#ratingStars .star').forEach(star => {
        star.classList.toggle('filled', parseInt(star.getAttribute('data-rating')) <= rating);
    });
}

function setupRatingActions() {
    const user = window.USER_DATA;
    if (!user || !['admin', 'pilot'].includes(user.role)) return;

    document.querySelectorAll('#ratingStars .star').forEach(star => {
        star.addEventListener('click', function () {
            const rating = parseInt(this.getAttribute('data-rating'));
            document.getElementById('ratingValue').value = rating;
            updateStarDisplay();
        });

        star.addEventListener('mouseover', function () {
            const rating = parseInt(this.getAttribute('data-rating'));
            document.querySelectorAll('#ratingStars .star').forEach(s => {
                s.classList.toggle('hover', parseInt(s.getAttribute('data-rating')) <= rating);
            });
        });
    });

    const starsContainer = document.getElementById('ratingStars');
    if (starsContainer) {
        starsContainer.addEventListener('mouseout', function () {
            document.querySelectorAll('#ratingStars .star').forEach(s => s.classList.remove('hover'));
        });
    }

    const ratingForm = document.getElementById('ratingForm');
    if (ratingForm) {
        ratingForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const rating = parseInt(document.getElementById('ratingValue').value);
            if (rating === 0) {
                alert('Please select a rating');
                return;
            }
            const formData = new FormData(this);

            fetch(apiPath('companies/rate'), {
                method: 'POST',
                body: new URLSearchParams(formData)
            }).then(r => { if (!r.ok) throw new Error('Failed to save rating: ' + r.statusText); return r.json(); })
              .then(data => {
                  if (data.message) {
                      alert('Thank you! Your evaluation has been submitted.');
                      setTimeout(() => { loadCompanyRatings(currentCompanyId); updateRatingDisplay(currentCompanyId); }, 100);
                  } else {
                      alert('Error: ' + (data.error || 'Failed to save rating'));
                  }
              }).catch(err => { console.error('Error submitting rating:', err); alert('Error: ' + err.message); });
        });
    }
}

function updateRatingDisplay(companyId) {
    const url = apiPath('companies/ratings?companyId=' + encodeURIComponent(companyId));
    fetch(url)
        .then(r => { if (!r.ok) throw new Error('Failed to fetch ratings'); return r.json(); })
        .then(data => {
            const display = document.getElementById('rating-display-' + companyId);
            if (!display) return;
            if (data.averageRating) {
                const stars = '★'.repeat(Math.round(data.averageRating));
                display.innerHTML = `<div><strong>${data.averageRating.toFixed(1)}</strong> ${stars}</div>`;
            } else {
                display.innerHTML = '<span style="color: var(--text-light); font-size: 12px;">No ratings</span>';
            }
        }).catch(err => console.error('Error updating rating display for company ' + companyId + ':', err));
}

function setupCompanyPage() {
    document.querySelectorAll('[id^="rating-display-"]').forEach(el => {
        const companyId = el.id.replace('rating-display-', '');
        updateRatingDisplay(companyId);
    });

    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function () {
            const companyId = this.getAttribute('data-company-id');
            companyDelete(companyId);
        });
    });

    const companyModal = document.getElementById('companyModal');
    if (companyModal) {
        companyModal.addEventListener('click', function (e) { if (e.target === this) closeCompanyModal(); });
    }
    const createModal = document.getElementById('companyCreateModal');
    if (createModal) {
        createModal.addEventListener('click', function (e) { if (e.target === this) closeCreateCompanyModal(); });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCompanyModal(); closeCompanyEditModal(); closeCreateCompanyModal();
        }
    });

    setupRatingActions();
}

function companyDelete(id) {
    if (!confirm('Are you sure you want to delete this company? All associated internships, applications, and ratings will also be deleted.')) return;

    fetch(apiPath('companies/delete'), {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'id=' + encodeURIComponent(id)
    }).then(r => {
        if (r.status === 204) {
            alert('Company and all associated data deleted successfully'); window.location.reload();
        } else {
            return r.json().then(data => { throw new Error(data.error || 'Failed to delete company'); });
        }
    }).catch(err => alert('Error: ' + err.message));
}

function companyEditFormInit() {
    const editForm = document.getElementById('company-edit-form');
    if (!editForm) return;

    editForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const companyId = document.getElementById('company-edit-id').value;
        const fd = new FormData(editForm);

        fetch(apiPath('companies/update?id=' + encodeURIComponent(companyId)), {
            method: 'POST', body: new URLSearchParams(fd)
        }).then(res => {
            if (!res.ok) { return res.json().then(data => { throw new Error(data.error || 'Failed to update company'); }); }
            return res.json();
        }).then(() => { alert('Company updated successfully!'); closeCompanyEditModal(); window.location.reload(); })
        .catch(err => alert('Error: ' + err.message));
    });

    const createForm = document.getElementById('company-create-form');
    if (createForm) {
        createForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const fd = new FormData(this);
            fetch(apiPath('companies/create'), {
                method: 'POST', body: new URLSearchParams(fd)
            }).then(res => {
                if (!res.ok) { return res.json().then(data => { throw new Error(data.error || 'Failed to create company'); }); }
                return res.json();
            }).then(() => { alert('Company created successfully!'); closeCreateCompanyModal(); window.location.reload(); })
            .catch(err => alert('Error: ' + err.message));
        });
    }
}

window.openCompanyEditModal = function(id) {
    fetch(apiPath('companies/detail?id=' + encodeURIComponent(id)))
        .then(r => { if (!r.ok) throw new Error('Failed to load company details'); return r.json(); })
        .then(company => {
            document.getElementById('company-edit-id').value = company.IdCompany;
            document.getElementById('company-edit-name').value = company.Name;
            document.getElementById('company-edit-description').value = company.Description || '';
            document.getElementById('company-edit-email').value = company.Email;
            document.getElementById('company-edit-phone').value = company.Phone || '';
            document.getElementById('company-edit-country').value = company.Id_Country || '';
            document.getElementById('companyEditModal').classList.add('show');
        }).catch(err => alert('Error loading company: ' + err.message));
};

window.closeCompanyEditModal = function() { document.getElementById('companyEditModal').classList.remove('show'); };
window.openCreateCompanyModal = function() { document.getElementById('companyCreateModal').classList.add('show'); };
window.closeCreateCompanyModal = function() { document.getElementById('companyCreateModal').classList.remove('show'); };

window.addEventListener('DOMContentLoaded', function() {
    setupCompanyPage();
    companyEditFormInit();
});