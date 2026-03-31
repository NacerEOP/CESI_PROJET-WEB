document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function () {
            const internshipId = this.getAttribute('data-internship-id');
            removeFromWishlist(internshipId, this);
        });
    });
});

async function removeFromWishlist(internshipId, buttonElement) {
    if (!confirm('Are you sure you want to remove this internship from your wish list?')) {
        return;
    }

    buttonElement.disabled = true;
    buttonElement.innerHTML = '<span class="icon">⏳</span> Removing...';

    try {
        const response = await fetch(`${window.APP_BASE_URL || ''}/api/wishlist/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `internshipId=${internshipId}`
        });
        const result = await response.json();
        if (result.success) {
            buttonElement.closest('.card').remove();
            const countElement = document.querySelector('.page-header p');
            if (countElement) {
                const currentCount = parseInt(countElement.textContent.match(/\d+/));
                const newCount = currentCount - 1;
                countElement.textContent = `${newCount} internship${newCount !== 1 ? 's' : ''} in your wish list`;
                if (newCount === 0) location.reload();
            }
        } else {
            alert('Error: ' + result.message);
            buttonElement.disabled = false;
            buttonElement.innerHTML = '<span class="icon">🗑️</span> Remove';
        }
    } catch (error) {
        alert('An error occurred. Please try again.');
        buttonElement.disabled = false;
        buttonElement.innerHTML = '<span class="icon">🗑️</span> Remove';
    }
}
