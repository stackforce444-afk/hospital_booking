/**
 * Main JavaScript file for Swasthya Setu
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize quick login form
    initQuickLoginForm();
    
    // Mobile navigation toggle
    initMobileNav();
});

/**
 * Initialize the quick login form on the homepage
 */
function initQuickLoginForm() {
    const quickLoginForm = document.getElementById('loginForm');
    if (!quickLoginForm) return;
    
    // Login form is handled by auth.js handleLogin function
    quickLoginForm.addEventListener('submit', handleLogin);
}

/**
 * Initialize mobile navigation
 */
function initMobileNav() {
    // Add mobile navigation toggle functionality here if needed
}