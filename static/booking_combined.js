/**
 * Swasthya Setu - Combined Booking Page JavaScript
 * This file contains all functionality for the appointment booking system
 */

// Enable mock API for development
window.MOCK_API = true;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Booking system initialized');
    
    // Check authentication status
    checkAuthForBooking();
    
    // Initialize the booking form
    initBookingForm();
    
    // Load hospitals and services data
    loadHospitalsAndServices();
    
    // Initialize date and time picker
    initDateTimePicker();
    
    // Initialize step navigation
    initStepNavigation();
    
    // Initialize time slot selection
    initTimeSlotSelection();
    
    // Add animation to doctor names in the doctor select
    animateDoctorNames();
    
    // Show the first section with animation
    const firstSection = document.getElementById('step-1');
    if (firstSection) {
        firstSection.classList.add('active');
    }
});

/**
 * Check if user is authenticated for booking
 */
function checkAuthForBooking() {
    const token = localStorage.getItem('token');
    const authCheckContainer = document.getElementById('auth-check');
    const bookingForm = document.getElementById('booking-form');
    
    if (!token) {
        // Show authentication check container
        if (authCheckContainer) {
            authCheckContainer.classList.remove('hidden');
        }
        
        // Hide booking steps if not authenticated
        const bookingSteps = document.querySelector('.booking-steps');
        if (bookingSteps) {
            bookingSteps.style.display = 'none';
        }
        
        // Hide booking form if not authenticated
        if (bookingForm) {
            bookingForm.style.display = 'none';
        }
        
        // Store current URL for redirect after login
        const currentUrl = window.location.href;
        const loginLink = document.querySelector('.auth-check-actions a[href*="login.html"]');
        if (loginLink) {
            loginLink.href = `login.html?redirect=${encodeURIComponent(currentUrl)}`;
        }
    } else {
        // Token exists, assume it's valid for demo purposes
        
        // Hide authentication check container
        if (authCheckContainer) {
            authCheckContainer.classList.add('hidden');
        }
        
        // Show booking steps if authenticated
        const bookingSteps = document.querySelector('.booking-steps');
        if (bookingSteps) {
            bookingSteps.style.display = 'flex';
        }
        
        // Show booking form if authenticated
        if (bookingForm) {
            bookingForm.style.display = 'block';
        }
        
        // Pre-fill user data if available
        prefillUserData();
    }
}

/**
 * Pre-fill user data in the form
 */
function prefillUserData() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.name) {
        const patientNameInput = document.getElementById('patientName');
        if (patientNameInput) {
            patientNameInput.value = user.name;
        }
    }
    
    if (user.email) {
        const patientEmailInput = document.getElementById('patientEmail');
        if (patientEmailInput) {
            patientEmailInput.value = user.email;
        }
    }
    
    if (user.phone) {
        const patientPhoneInput = document.getElementById('patientPhone');
        if (patientPhoneInput) {
            patientPhoneInput.value = user.phone;
        }
    }
    
    // Pre-fill gender if available
    if (user.gender) {
        const genderSelect = document.getElementById('patientGender');
        if (genderSelect) {
            genderSelect.value = user.gender;
        }
    }
}