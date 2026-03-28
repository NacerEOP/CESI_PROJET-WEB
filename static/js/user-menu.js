/**
 * user-menu.js
 * Handle user profile dropdown menu functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (!userProfileBtn || !userDropdown) {
        return; // User not logged in or elements not found
    }

    // Toggle dropdown on profile picture click
    userProfileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-menu-container')) {
            userDropdown.classList.remove('active');
        }
    });

    // Close dropdown when clicking a menu item
    const dropdownItems = userDropdown.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function() {
            userDropdown.classList.remove('active');
        });
    });
});
