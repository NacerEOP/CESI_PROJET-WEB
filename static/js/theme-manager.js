/**
 * theme-manager.js
 * Handle theme switching and persistence
 */

class ThemeManager {
    constructor() {
        this.themeToggle = null;
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        // Load saved theme preference for all pages
        this.loadTheme();

        // Get theme toggle element (settings page only)
        this.themeToggle = document.getElementById('theme-toggle');

        if (!this.themeToggle) {
            return; // No toggle on this page, but theme is already applied
        }

        // Set up event listener
        this.themeToggle.addEventListener('change', (e) => {
            this.setTheme(e.target.checked ? 'dark' : 'light');
        });

        // Update toggle state based on current theme
        this.updateToggleState();
    }

    loadTheme() {
        // Check for saved theme preference or default to light
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;

        // Apply theme to document
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        // Save preference
        localStorage.setItem('theme', theme);

        // Update toggle state
        this.updateToggleState();
    }

    updateToggleState() {
        if (this.themeToggle) {
            this.themeToggle.checked = this.currentTheme === 'dark';
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ThemeManager();
});