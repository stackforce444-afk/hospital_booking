/**
 * Dashboard functionality for Swasthya Setu
 * Enhanced version with better error handling and user experience
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    // Check if token is expired
    if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
        // Redirect to login with message
        window.location.href = 'login.html?redirect=dashboard.html&message=' + 
            encodeURIComponent('Your session has expired. Please login again.');
        return;
    }
    
    if (!token || !user.id) {
        // Redirect to login if not logged in
        window.location.href = 'login.html?redirect=dashboard.html';
        return;
    }
    
    // Update user name in sidebar
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = user.name || 'User';
    }
    
    // Load user appointments
    loadAppointments();
    
    // Initialize appointment filter
    const appointmentFilter = document.getElementById('appointment-filter');
    if (appointmentFilter) {
        appointmentFilter.addEventListener('change', function() {
            loadAppointments(this.value);
        });
    }
    
    // Add event listeners to dashboard menu items
    setupDashboardNavigation();
});

/**
 * Setup dashboard navigation
 */
function setupDashboardNavigation() {
    const menuItems = document.querySelectorAll('.dashboard-menu li a');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Skip for logout button
            if (this.classList.contains('logout-button')) {
                return;
            }
            
            e.preventDefault();
            
            // Get section ID from href
            const sectionId = this.getAttribute('href').substring(1);
            
            // Remove active class from all menu items
            menuItems.forEach(menuItem => {
                menuItem.parentElement.classList.remove('active');
            });
            
            // Add active class to clicked menu item
            this.parentElement.classList.add('active');
            
            // Show corresponding section
            showDashboardSection(sectionId);
        });
    });
}

/**
 * Show dashboard section and hide others
 * @param {string} sectionId - ID of section to show
 */
function showDashboardSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show requested section
    const section = document.getElementById(`${sectionId}-section`);
    if (section) {
        section.style.display = 'block';
    }
    
    // Load section data if needed
    switch (sectionId) {
        case 'appointments':
            loadAppointments(document.getElementById('appointment-filter')?.value || 'all');
            break;
        case 'profile':
            loadUserProfile();
            break;
        case 'medical-records':
            loadMedicalRecords();
            break;
        case 'settings':
            loadUserSettings();
            break;
    }
}

/**
 * Load user appointments from API with improved error handling
 * @param {string} filter - Filter to apply to appointments (all, upcoming, past, cancelled)
 */
function loadAppointments(filter = 'all') {
    const appointmentsList = document.getElementById('appointments-list');
    const noAppointments = document.getElementById('no-appointments');
    
    if (!appointmentsList || !noAppointments) return;
    
    // Show loading state
    appointmentsList.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading appointments...</p>
        </div>
    `;
    
    // Hide no appointments message
    noAppointments.classList.add('hidden');
    
    // Get token
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html?redirect=dashboard.html';
        return;
    }
    
    // Fetch appointments from API
    fetch(`${API_BASE_URL}/appointments`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
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
            throw new Error('Failed to load appointments');
        }
        
        return response.json();
    })
    .then(data => {
        // Check if we have appointments array
        const appointments = Array.isArray(data) ? data : (data.appointments || []);
        
        // Filter appointments if needed
        let filteredAppointments = appointments;
        
        if (filter !== 'all') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            filteredAppointments = appointments.filter(appointment => {
                const appointmentDate = new Date(appointment.date);
                
                switch (filter) {
                    case 'upcoming':
                        return appointmentDate >= today && appointment.status !== 'cancelled';
                    case 'past':
                        return appointmentDate < today && appointment.status !== 'cancelled';
                    case 'cancelled':
                        return appointment.status === 'cancelled';
                    default:
                        return true;
                }
            });
        }
        
        // Check if there are any appointments
        if (filteredAppointments.length === 0) {
            appointmentsList.innerHTML = '';
            noAppointments.classList.remove('hidden');
            return;
        }
        
        // Sort appointments by date (newest first)
        filteredAppointments.sort((a, b) => {
            const dateA = new Date(a.date || a.appointment_date);
            const dateB = new Date(b.date || b.appointment_date);
            return dateB - dateA;
        });
        
        // Render appointments
        appointmentsList.innerHTML = filteredAppointments.map(appointment => {
            // Handle different date formats
            const dateStr = appointment.date || appointment.appointment_date;
            const appointmentDate = new Date(dateStr);
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
            
            return `
                <div class="appointment-card">
                    <div class="appointment-header">
                        <div class="appointment-date">
                            <i class="fas fa-calendar-day"></i>
                            <span>${formattedDate}</span>
                        </div>
                        <div class="appointment-time">
                            <i class="fas fa-clock"></i>
                            <span>${timeStr}</span>
                        </div>
                        <div class="appointment-status ${statusClass}">
                            ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </div>
                    </div>
                    
                    <div class="appointment-details">
                        <div class="appointment-hospital">
                            <i class="fas fa-hospital"></i>
                            <span>${appointment.hospital || 'Hospital'}</span>
                        </div>
                        <div class="appointment-service">
                            <i class="fas fa-stethoscope"></i>
                            <span>${appointment.service || 'Service'}</span>
                        </div>
                        <div class="appointment-doctor">
                            <i class="fas fa-user-md"></i>
                            <span>${appointment.doctor || 'Doctor'}</span>
                        </div>
                    </div>
                    
                    <div class="appointment-actions">
                        ${appointment.status !== 'cancelled' && appointment.status !== 'completed' ? 
                            `<button class="btn-secondary cancel-appointment" data-id="${appointment.id}">
                                <i class="fas fa-times"></i> Cancel
                            </button>` : ''
                        }
                        <button class="btn-primary view-appointment" data-id="${appointment.id}">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners to appointment action buttons
        const cancelButtons = document.querySelectorAll('.cancel-appointment');
        cancelButtons.forEach(button => {
            button.addEventListener('click', function() {
                const appointmentId = this.getAttribute('data-id');
                cancelAppointment(appointmentId);
            });
        });
        
        const viewButtons = document.querySelectorAll('.view-appointment');
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const appointmentId = this.getAttribute('data-id');
                viewAppointmentDetails(appointmentId);
            });
        });
    })
    .catch(error => {
        console.error('Error loading appointments:', error);
        
        if (error.message !== 'Unauthorized') {
            appointmentsList.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load appointments. Please try again later.</p>
                    <button class="btn-secondary retry-button" onclick="loadAppointments('${filter}')">
                        <i class="fas fa-sync"></i> Retry
                    </button>
                </div>
            `;
        }
    });
}