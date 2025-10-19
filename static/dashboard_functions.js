/**
 * Additional dashboard functions for Swasthya Setu
 */

/**
 * Cancel an appointment with improved error handling
 * @param {string} appointmentId - ID of appointment to cancel
 */
function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }
    
    // Get token
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html?redirect=dashboard.html';
        return;
    }
    
    // Show loading state on the button
    const button = document.querySelector(`.cancel-appointment[data-id="${appointmentId}"]`);
    const originalButtonHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelling...';
    
    // Send cancel request to API
    fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            window.location.href = 'login.html?redirect=dashboard.html&message=' + 
                encodeURIComponent('Your session has expired. Please login again.');
            throw new Error('Unauthorized');
        }
        
        if (!response.ok) {
            throw new Error('Failed to cancel appointment');
        }
        
        return response.json();
    })
    .then(data => {
        // Show success message
        const appointmentCard = button.closest('.appointment-card');
        const statusElement = appointmentCard.querySelector('.appointment-status');
        
        // Update status in UI
        statusElement.className = 'appointment-status status-cancelled';
        statusElement.textContent = 'Cancelled';
        
        // Remove cancel button
        button.remove();
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'appointment-message success';
        successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Appointment cancelled successfully';
        appointmentCard.appendChild(successMessage);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 3000);
        
        // Reload appointments after a delay
        setTimeout(() => {
            loadAppointments(document.getElementById('appointment-filter').value);
        }, 2000);
    })
    .catch(error => {
        console.error('Error cancelling appointment:', error);
        
        // Reset button
        if (button) {
            button.disabled = false;
            button.innerHTML = originalButtonHtml;
            
            // Show error message
            const appointmentCard = button.closest('.appointment-card');
            const errorMessage = document.createElement('div');
            errorMessage.className = 'appointment-message error';
            errorMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to cancel appointment. Please try again.';
            appointmentCard.appendChild(errorMessage);
            
            // Remove message after 3 seconds
            setTimeout(() => {
                errorMessage.remove();
            }, 3000);
        }
    });
}

/**
 * View appointment details
 * @param {string} appointmentId - ID of appointment to view
 */
function viewAppointmentDetails(appointmentId) {
    // Get token
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html?redirect=dashboard.html';
        return;
    }
    
    // Create modal for appointment details
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Appointment Details</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading appointment details...</p>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Close modal on click
    const closeButton = modal.querySelector('.close-modal');
    closeButton.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    });
    
    // Fetch appointment details
    fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load appointment details');
        }
        return response.json();
    })
    .then(appointment => {
        // Format date and time
        const appointmentDate = new Date(appointment.date || appointment.appointment_date);
        const formattedDate = appointmentDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Handle different time formats
        const timeStr = appointment.time || 
            (appointment.appointment_time ? 
                (typeof appointment.appointment_time === 'string' ? 
                    appointment.appointment_time : 
                    appointment.appointment_time.toString()) : 
                '');
        
        // Get status class
        let statusClass = '';
        switch (appointment.status) {
            case 'confirmed':
                statusClass = 'status-confirmed';
                break;
            case 'pending':
                statusClass = 'status-pending';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                break;
            case 'completed':
                statusClass = 'status-completed';
                break;
            default:
                statusClass = '';
        }
        
        // Update modal content
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="appointment-detail-card">
                <div class="appointment-detail-header">
                    <div class="appointment-detail-status ${statusClass}">
                        ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </div>
                </div>
                
                <div class="appointment-detail-info">
                    <div class="detail-row">
                        <div class="detail-label">Appointment ID:</div>
                        <div class="detail-value">${appointment.id}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Date:</div>
                        <div class="detail-value">${formattedDate}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Time:</div>
                        <div class="detail-value">${timeStr}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Hospital:</div>
                        <div class="detail-value">${appointment.hospital || 'Not specified'}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Service:</div>
                        <div class="detail-value">${appointment.service || 'Not specified'}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Doctor:</div>
                        <div class="detail-value">${appointment.doctor || 'Not specified'}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Created:</div>
                        <div class="detail-value">${new Date(appointment.created_at).toLocaleString()}</div>
                    </div>
                </div>
                
                <div class="appointment-detail-actions">
                    ${appointment.status !== 'cancelled' && appointment.status !== 'completed' ? 
                        `<button class="btn-secondary cancel-detail-appointment" data-id="${appointment.id}">
                            <i class="fas fa-times"></i> Cancel Appointment
                        </button>` : ''
                    }
                    <button class="btn-primary print-appointment" data-id="${appointment.id}">
                        <i class="fas fa-print"></i> Print Details
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to buttons
        const cancelButton = modalBody.querySelector('.cancel-detail-appointment');
        if (cancelButton) {
            cancelButton.addEventListener('click', function() {
                const appointmentId = this.getAttribute('data-id');
                
                // Close modal
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                }, 300);
                
                // Cancel appointment
                cancelAppointment(appointmentId);
            });
        }
        
        const printButton = modalBody.querySelector('.print-appointment');
        if (printButton) {
            printButton.addEventListener('click', function() {
                // Print appointment details
                const printWindow = window.open('', '_blank');
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Appointment Details - ${appointment.id}</title>
                            <style>
                                body { font-family: Arial, sans-serif; line-height: 1.6; }
                                .header { text-align: center; margin-bottom: 20px; }
                                .appointment-info { margin-bottom: 30px; }
                                .detail-row { margin-bottom: 10px; display: flex; }
                                .detail-label { font-weight: bold; width: 150px; }
                                .footer { margin-top: 50px; text-align: center; font-size: 12px; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>Swasthya Setu</h1>
                                <h2>Appointment Details</h2>
                            </div>
                            
                            <div class="appointment-info">
                                <div class="detail-row">
                                    <div class="detail-label">Appointment ID:</div>
                                    <div class="detail-value">${appointment.id}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Status:</div>
                                    <div class="detail-value">${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Date:</div>
                                    <div class="detail-value">${formattedDate}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Time:</div>
                                    <div class="detail-value">${timeStr}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Hospital:</div>
                                    <div class="detail-value">${appointment.hospital || 'Not specified'}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Service:</div>
                                    <div class="detail-value">${appointment.service || 'Not specified'}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Doctor:</div>
                                    <div class="detail-value">${appointment.doctor || 'Not specified'}</div>
                                </div>
                            </div>
                            
                            <div class="footer">
                                <p>Printed on ${new Date().toLocaleString()}</p>
                                <p>Swasthya Setu - Your bridge to quality healthcare</p>
                            </div>
                        </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
            });
        }
    })
    .catch(error => {
        console.error('Error loading appointment details:', error);
        
        // Show error in modal
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Failed to load appointment details. Please try again later.</p>
                <button class="btn-secondary" onclick="modal.remove()">Close</button>
            </div>
        `;
    });
}

/**
 * Load user profile data
 */
function loadUserProfile() {
    // Implementation for loading user profile
    console.log('Loading user profile...');
}

/**
 * Load user medical records
 */
function loadMedicalRecords() {
    // Implementation for loading medical records
    console.log('Loading medical records...');
}

/**
 * Load user settings
 */
function loadUserSettings() {
    // Implementation for loading user settings
    console.log('Loading user settings...');
}