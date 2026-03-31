document.addEventListener('DOMContentLoaded', function () {
    const dataScript = document.getElementById('internship-detail-data');
    let internshipId = 0;
    let inWishlist = false;

    if (dataScript && dataScript.textContent) {
        try {
            const parsed = JSON.parse(dataScript.textContent);
            internshipId = parsed.internshipId || 0;
            inWishlist = parsed.inWishlist || false;
        } catch (e) {
            console.warn('Invalid internship detail data', e);
        }
    }

    initializeWishlistButton(internshipId, inWishlist);

    const wishlistBtn = document.getElementById('wishlistBtn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', function () {
            const internshipId = this.getAttribute('data-internship-id');
            toggleWishlist(internshipId);
        });
    }
});

function initializeWishlistButton(internshipId, inWishlist) {
    const btn = document.getElementById('wishlistBtn');
    const icon = document.getElementById('wishlistIcon');
    const text = document.getElementById('wishlistText');

    if (!btn || !icon || !text) return;

    if (inWishlist) {
        btn.className = 'button danger';
        icon.textContent = '❤️';
        text.textContent = 'Remove from Wish List';
    } else {
        btn.className = 'button secondary';
        icon.textContent = '🤍';
        text.textContent = 'Add to Wish List';
    }
}

async function toggleWishlist(internshipId) {
    const baseUrl = window.APP_BASE_URL || '';
    const btn = document.getElementById('wishlistBtn');
    const icon = document.getElementById('wishlistIcon');
    const text = document.getElementById('wishlistText');
    if (!btn || !icon || !text) return;

    btn.disabled = true;
    const originalText = text.textContent;
    const originalIcon = icon.textContent;

    icon.textContent = '⏳';
    text.textContent = 'Processing...';

    try {
        const isInWishlist = btn.classList.contains('danger');
        const endpoint = isInWishlist ? 'remove' : 'add';

        const response = await fetch(`${baseUrl}/api/wishlist/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `internshipId=${internshipId}`
        });

        if (!response.ok) throw new Error('Request failed');
        const result = await response.json();

        if (result.success) {
            initializeWishlistButton(internshipId, !isInWishlist);
        } else {
            throw new Error(result.message || 'Unknown error');
        }
    } catch (error) {
        alert('Wishlist update failed: ' + error.message);
        icon.textContent = originalIcon;
        text.textContent = originalText;
    } finally {
        btn.disabled = false;
    }
}

window.initializeWishlistButton = initializeWishlistButton;
window.toggleWishlist = toggleWishlist;