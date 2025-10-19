/**
 * Validate a specific step in the booking form
 */
function validateStep(stepNumber) {
    const form = document.getElementById('booking-form');
    
    switch(stepNumber) {
        case 1:
            // Validate hospital and service selection
            const hospital = form.querySelector('#hospital').value;
            const service = form.querySelector('#service').value;
            
            if (!hospital || !service) {
                showMessage('Please select both hospital and service', 'error');
                
                // Highlight the empty fields
                if (!hospital) {
                    highlightField('#hospital');
                }
                if (!service) {
                    highlightField('#service');
                }
                
                return false;
            }
            return true;
            
        case 2:
            // Validate date and time selection
            const date = form.querySelector('#appointmentDate').value;
            const time = form.querySelector('#appointmentTime').value;
            
            if (!date || !time) {
                showMessage('Please select both date and time', 'error');
                
                // Highlight the empty fields
                if (!date) {
                    highlightField('#appointmentDate');
                }
                if (!time) {
                    highlightField('#appointmentTime');
                }
                
                return false;
            }
            
            // Validate date is not in the past
            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showMessage('Please select a future date', 'error');
                highlightField('#appointmentDate');
                return false;
            }
            
            return true;
            
        case 3:
            // Validate patient details
            const name = form.querySelector('#patientName').value;
            const age = form.querySelector('#patientAge').value;
            const gender = form.querySelector('#patientGender').value;
            const phone = form.querySelector('#patientPhone').value;
            const email = form.querySelector('#patientEmail').value;
            
            if (!name || !age || !gender || !phone || !email) {
                showMessage('Please fill in all required patient details', 'error');
                
                // Highlight empty fields
                if (!name) highlightField('#patientName');
                if (!age) highlightField('#patientAge');
                if (!gender) highlightField('#patientGender');
                if (!phone) highlightField('#patientPhone');
                if (!email) highlightField('#patientEmail');
                
                return false;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Please enter a valid email address', 'error');
                highlightField('#patientEmail');
                return false;
            }
            
            // Validate phone format
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone.replace(/[^0-9]/g, ''))) {
                showMessage('Please enter a valid 10-digit phone number', 'error');
                highlightField('#patientPhone');
                return false;
            }
            
            // Validate age
            if (isNaN(age) || parseInt(age) <= 0 || parseInt(age) > 120) {
                showMessage('Please enter a valid age between 1 and 120', 'error');
                highlightField('#patientAge');
                return false;
            }
            
            return true;
            
        default:
            return true;
    }
}

/**
 * Highlight a field with error
 */
function highlightField(selector) {
    const field = document.querySelector(selector);
    if (!field) return;
    
    field.classList.add('error');
    field.addEventListener('input', function onInput() {
        field.classList.remove('error');
        field.removeEventListener('input', onInput);
    });
}

/**
 * Show message in the form
 */
function showMessage(text, type) {
    const messageContainer = document.getElementById('booking-message');
    if (!messageContainer) return;
    
    messageContainer.textContent = text;
    messageContainer.className = `message ${type}`;
    messageContainer.classList.remove('hidden');
    
    // Add animation
    messageContainer.style.animation = 'none';
    setTimeout(() => {
        messageContainer.style.animation = 'fadeInUp 0.5s ease-out';
    }, 10);
    
    // Hide message after 5 seconds
    setTimeout(() => {
        messageContainer.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => {
            messageContainer.classList.add('hidden');
        }, 500);
    }, 5000);
}