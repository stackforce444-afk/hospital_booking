/**
 * Initialize date and time picker
 */
function initDateTimePicker() {
    // Date picker
    const dateInput = document.querySelector('#appointmentDate');
    if (dateInput) {
        // Set min date to today
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        
        dateInput.min = `${yyyy}-${mm}-${dd}`;
        
        // Set max date to 3 months from now
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        
        const maxYyyy = maxDate.getFullYear();
        const maxMm = String(maxDate.getMonth() + 1).padStart(2, '0');
        const maxDd = String(maxDate.getDate()).padStart(2, '0');
        
        dateInput.max = `${maxYyyy}-${maxMm}-${maxDd}`;
        
        // Add change event to update available times
        dateInput.addEventListener('change', updateAvailableTimes);
    }
}

/**
 * Update available times based on selected date, hospital, service, and doctor
 */
function updateAvailableTimes() {
    const dateInput = document.querySelector('#appointmentDate');
    const hospitalSelect = document.querySelector('#hospital');
    const serviceSelect = document.querySelector('#service');
    const doctorSelect = document.querySelector('#doctor');
    const timeSlots = document.querySelectorAll('.time-slot');
    
    if (!dateInput || !hospitalSelect || !serviceSelect || !timeSlots.length) return;
    
    // Check if all required fields are selected
    if (!dateInput.value || hospitalSelect.value === '' || serviceSelect.value === '') {
        return;
    }
    
    // Reset all time slots
    timeSlots.forEach(slot => {
        slot.classList.remove('unavailable');
        slot.classList.remove('selected');
        slot.classList.add('loading');
    });
    
    // Get selected values
    const date = dateInput.value;
    const hospitalId = hospitalSelect.value;
    const serviceId = serviceSelect.value;
    const doctorId = doctorSelect.value || null;
    
    // Fetch available slots from API
    SwasthyaSetuAPI.Appointments.getAvailableSlots(date, hospitalId, serviceId, doctorId)
        .then(data => {
            // Remove loading state
            timeSlots.forEach(slot => {
                slot.classList.remove('loading');
            });
            
            // Mark unavailable times
            if (data && data.unavailable_slots) {
                const unavailableTimes = data.unavailable_slots.map(slot => slot.time);
                
                timeSlots.forEach(slot => {
                    const slotTime = slot.textContent.trim();
                    if (unavailableTimes.includes(slotTime)) {
                        slot.classList.add('unavailable');
                    }
                });
            }
        })
        .catch(error => {
            console.warn('Could not load available slots:', error);
            
            // Remove loading state
            timeSlots.forEach(slot => {
                slot.classList.remove('loading');
            });
            
            // Show error message
            showMessage('Failed to load available time slots. Please try again.', 'error');
            
            // Fallback to simulated data
            simulateAvailableSlots(timeSlots);
        });
}

/**
 * Simulate available slots when API fails
 */
function simulateAvailableSlots(timeSlots) {
    // Simulate some unavailable times
    const unavailableTimes = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];
    
    // Mark unavailable times
    timeSlots.forEach(slot => {
        if (unavailableTimes.includes(slot.textContent.trim())) {
            slot.classList.add('unavailable');
        }
    });
}

// Combine all the script parts into the main booking.js file
document.addEventListener('DOMContentLoaded', function() {
    // Load all script parts
    const scriptParts = [
        'booking_part2.js',
        'booking_part3.js',
        'booking_part4.js',
        'booking_part5.js',
        'booking_part6.js',
        'booking_part7.js'
    ];
    
    // Load each script part
    scriptParts.forEach(part => {
        const script = document.createElement('script');
        script.src = `scripts/${part}`;
        document.head.appendChild(script);
    });
});