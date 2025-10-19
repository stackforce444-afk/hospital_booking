/**
 * Create confirmation overlay after successful booking
 */
function createConfirmationOverlay(appointmentData, appointmentId) {
    // Get form data for display
    const form = document.getElementById('booking-form');
    const hospitalSelect = form.querySelector('#hospital');
    const serviceSelect = form.querySelector('#service');
    const doctorSelect = form.querySelector('#doctor');
    const date = form.querySelector('#appointmentDate').value;
    const time = form.querySelector('#appointmentTime').value;
    const patientName = form.querySelector('#patientName').value;
    
    // Format date for display
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const hospitalName = hospitalSelect.options[hospitalSelect.selectedIndex].text;
    const serviceName = serviceSelect.options[serviceSelect.selectedIndex].text;
    const doctorName = doctorSelect.selectedIndex > 0 ? 
        doctorSelect.options[doctorSelect.selectedIndex].text : 'Any Available Doctor';
    
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'confirmation-overlay';
    
    overlay.innerHTML = `
        <div class="confirmation-modal">
            <div class="confirmation-header">
                <i class="fas fa-check-circle"></i>
                <h2>Appointment Confirmed!</h2>
            </div>
            <div class="confirmation-details">
                <p>Your appointment has been successfully booked.</p>
                <div class="confirmation-info">
                    <div class="info-item">
                        <span class="info-label">Appointment ID:</span>
                        <span class="info-value">${appointmentId || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Hospital:</span>
                        <span class="info-value">${hospitalName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Service:</span>
                        <span class="info-value">${serviceName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Doctor:</span>
                        <span class="info-value ${doctorSelect.selectedIndex > 0 ? 'doctor-name' : ''}">${doctorName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date:</span>
                        <span class="info-value">${formattedDate}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Time:</span>
                        <span class="info-value">${time}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Patient:</span>
                        <span class="info-value">${patientName}</span>
                    </div>
                </div>
                <p class="confirmation-note">A confirmation email has been sent to your registered email address.</p>
            </div>
            <div class="confirmation-actions">
                <button id="view-appointments" class="btn btn-primary">View My Appointments</button>
                <button id="book-another" class="btn btn-secondary">Book Another Appointment</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add event listeners to buttons
    document.getElementById('view-appointments').addEventListener('click', function() {
        window.location.href = 'dashboard.html';
    });
    
    document.getElementById('book-another').addEventListener('click', function() {
        window.location.reload();
    });
}

/**
 * Convert time from 12-hour format to 24-hour format
 */
function convertTimeFormat(time12h) {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
        hours = '00';
    }
    
    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours}:${minutes}`;
}

/**
 * Validate the booking form
 */
function validateBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) return false;
    
    // Check if terms are accepted
    const termsCheckbox = bookingForm.querySelector('#confirm-terms');
    if (!termsCheckbox.checked) {
        showMessage('Please accept the terms of service', 'error');
        return false;
    }
    
    return true;
}