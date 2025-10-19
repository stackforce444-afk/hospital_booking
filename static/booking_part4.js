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
                
                if (error.message.includes('token') || error.message.includes('auth')) {
                    showMessage('Your session has expired. Please log in again.', 'error');
                    setTimeout(() => {
                        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
                    }, 2000);
                } else {
                    // Show error message
                    showMessage('Error booking appointment: ' + error.message, 'error');
                }
            });
    });
}