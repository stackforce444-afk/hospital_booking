/**
 * Update the appointment summary in the final step
 */
function updateSummary() {
    const form = document.getElementById('booking-form');
    
    // Get selected values
    const hospitalSelect = form.querySelector('#hospital');
    const serviceSelect = form.querySelector('#service');
    const doctorSelect = form.querySelector('#doctor');
    const date = form.querySelector('#appointmentDate').value;
    const time = form.querySelector('#appointmentTime').value;
    const patientName = form.querySelector('#patientName').value;
    const patientPhone = form.querySelector('#patientPhone').value;
    
    // Format date for display
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Update summary fields
    document.getElementById('summary-hospital').textContent = hospitalSelect.options[hospitalSelect.selectedIndex].text;
    document.getElementById('summary-service').textContent = serviceSelect.options[serviceSelect.selectedIndex].text;
    
    // Update doctor with special styling if a specific doctor is selected
    const doctorElement = document.getElementById('summary-doctor');
    if (doctorSelect.selectedIndex > 0) {
        doctorElement.textContent = doctorSelect.options[doctorSelect.selectedIndex].text;
        doctorElement.classList.add('doctor-name');
    } else {
        doctorElement.textContent = 'Any Available Doctor';
        doctorElement.classList.remove('doctor-name');
    }
    
    document.getElementById('summary-date').textContent = formattedDate;
    document.getElementById('summary-time').textContent = time;
    document.getElementById('summary-patient').textContent = patientName;
    document.getElementById('summary-contact').textContent = patientPhone;
    
    // Add animation to the summary
    const summaryItems = document.querySelectorAll('.summary-item');
    summaryItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 * index);
    });
}

/**
 * Initialize the booking form with validation and submission handling
 */
function initBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) return;
    
    // Add form submission handler
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateBookingForm()) {
            return false;
        }
        
        // Get form data
        const formData = new FormData(bookingForm);
        
        // Create appointment data object
        const appointmentData = {
            hospital_id: parseInt(formData.get('hospital')),
            service_id: parseInt(formData.get('service')),
            doctor_id: parseInt(formData.get('doctor')) || null, // Use null if no doctor selected
            appointment_date: formData.get('appointmentDate'),
            appointment_time: convertTimeFormat(formData.get('appointmentTime')),
            patient_name: formData.get('patientName'),
            patient_age: parseInt(formData.get('patientAge')),
            patient_gender: formData.get('patientGender'),
            patient_phone: formData.get('patientPhone'),
            patient_email: formData.get('patientEmail'),
            symptoms: formData.get('symptoms') || ''
        };
        
        // Show loading state
        const submitButton = bookingForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Get token
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('You must be logged in to book an appointment', 'error');
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            return;
        }
        
        // Submit booking to API
        SwasthyaSetuAPI.Appointments.create(appointmentData)
            .then(data => {
                // Reset button
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                
                // Show success message
                showMessage('Appointment booked successfully!', 'success');
                
                // Create confirmation overlay
                createConfirmationOverlay(appointmentData, data.appointment_id);
            })
            .catch(error => {
                // Reset button
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                
                // Show error message
                showMessage('Error booking appointment: ' + (error.message || 'Please try again'), 'error');
                console.error('Booking error:', error);
            });
    });
}

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