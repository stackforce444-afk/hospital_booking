/**
 * Load hospitals and services data from API
 */
function loadHospitalsAndServices() {
    const hospitalSelect = document.querySelector('#hospital');
    const serviceSelect = document.querySelector('#service');
    const doctorSelect = document.querySelector('#doctor');
    
    if (!hospitalSelect || !serviceSelect) return;
    
    // Show loading state
    hospitalSelect.innerHTML = '<option value="">Loading hospitals...</option>';
    serviceSelect.innerHTML = '<option value="">Select a Service</option>';
    
    // Load hospitals
    SwasthyaSetuAPI.Hospitals.getAll()
        .then(data => {
            // Reset options
            hospitalSelect.innerHTML = '<option value="">Select a Hospital</option>';
            
            // Add hospital options
            data.forEach(hospital => {
                const option = document.createElement('option');
                option.value = hospital.id;
                option.textContent = hospital.name;
                hospitalSelect.appendChild(option);
            });
            
            // Check if there's a pre-selected hospital from URL
            const urlParams = new URLSearchParams(window.location.search);
            const hospitalId = urlParams.get('hospital');
            
            if (hospitalId) {
                hospitalSelect.value = hospitalId;
                loadDoctorsByHospital(hospitalId);
            }
        })
        .catch(error => {
            console.warn('Could not load hospital data from API:', error);
            hospitalSelect.innerHTML = '<option value="">Error loading hospitals</option>';
            showMessage('Failed to load hospitals. Please try refreshing the page.', 'error');
        });
    
    // Load services
    SwasthyaSetuAPI.Services.getAll()
        .then(data => {
            // Reset options
            serviceSelect.innerHTML = '<option value="">Select a Service</option>';
            
            // Add service options
            data.forEach(service => {
                const option = document.createElement('option');
                option.value = service.id;
                option.textContent = service.name;
                serviceSelect.appendChild(option);
            });
            
            // Check if there's a pre-selected service from URL
            const urlParams = new URLSearchParams(window.location.search);
            const serviceId = urlParams.get('service');
            
            if (serviceId) {
                serviceSelect.value = serviceId;
            }
        })
        .catch(error => {
            console.warn('Could not load service data from API:', error);
            serviceSelect.innerHTML = '<option value="">Error loading services</option>';
            showMessage('Failed to load services. Please try refreshing the page.', 'error');
        });
    
    // Add hospital change event to load doctors
    hospitalSelect.addEventListener('change', function() {
        const hospitalId = this.value;
        if (hospitalId) {
            loadDoctorsByHospital(hospitalId);
        } else {
            // Reset doctor options
            doctorSelect.innerHTML = '<option value="">Any Available Doctor</option>';
            
            // Hide doctor preview
            const doctorPreview = document.getElementById('doctor-preview');
            if (doctorPreview) {
                doctorPreview.style.display = 'none';
            }
        }
    });
    
    // Add service change event to update available doctors
    serviceSelect.addEventListener('change', function() {
        const hospitalId = hospitalSelect.value;
        if (hospitalId) {
            loadDoctorsByHospital(hospitalId, this.value);
        }
    });
}

/**
 * Load doctors by hospital and optionally filtered by service
 */
function loadDoctorsByHospital(hospitalId, serviceId = null) {
    const doctorSelect = document.querySelector('#doctor');
    if (!doctorSelect) return;
    
    // Show loading state
    doctorSelect.innerHTML = '<option value="">Loading doctors...</option>';
    
    // Fetch doctors for the selected hospital
    let apiPromise;
    
    if (serviceId) {
        // If service is selected, get doctors for that service at the hospital
        apiPromise = SwasthyaSetuAPI.Services.getDoctors(serviceId)
            .then(doctors => {
                // Filter doctors by hospital
                return doctors.filter(doctor => doctor.hospital_id == hospitalId);
            });
    } else {
        // Otherwise get all doctors at the hospital
        apiPromise = SwasthyaSetuAPI.Hospitals.getDoctors(hospitalId);
    }
    
    apiPromise
        .then(doctors => {
            // Reset options
            doctorSelect.innerHTML = '<option value="">Any Available Doctor</option>';
            
            // Add doctor options
            if (doctors && doctors.length > 0) {
                doctors.forEach((doctor, index) => {
                    const option = document.createElement('option');
                    option.value = doctor.id;
                    option.textContent = doctor.name;
                    option.style.animationDelay = `${index * 0.3}s`;
                    doctorSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.warn('Could not load doctor data from API:', error);
            doctorSelect.innerHTML = '<option value="">Error loading doctors</option>';
        });
}

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