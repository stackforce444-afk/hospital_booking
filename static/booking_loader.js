/**
 * Script loader for booking functionality
 * This file loads all the booking script parts and combines their functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Booking loader initialized');
    
    // Load all required scripts in the correct order
    loadScript('scripts/booking.js', function() {
        loadScript('scripts/booking_navigation.js', function() {
            loadScript('scripts/booking_validation.js', function() {
                loadScript('scripts/booking_data.js', function() {
                    loadScript('scripts/booking_submission.js', function() {
                        console.log('All booking scripts loaded');
                        // Initialize booking functionality
                        initializeBooking();
                    });
                });
            });
        });
    });
});

/**
 * Load a script dynamically
 */
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    
    // When script is loaded, execute callback
    script.onload = function() {
        console.log(`Script loaded: ${url}`);
        if (callback) callback();
    };
    
    // Handle errors
    script.onerror = function() {
        console.error(`Error loading script: ${url}`);
        if (callback) callback();
    };
    
    document.head.appendChild(script);
}

/**
 * Initialize booking functionality
 */
function initializeBooking() {
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
}