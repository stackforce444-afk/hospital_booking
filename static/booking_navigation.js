/**
 * Initialize step navigation for the booking form
 */
function initStepNavigation() {
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const steps = document.querySelectorAll('.booking-steps .step');
    const sections = document.querySelectorAll('.booking-section');
    
    // Next step buttons
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Find current step
            const currentSection = this.closest('.booking-section');
            const currentIndex = Array.from(sections).indexOf(currentSection);
            
            // Validate current step
            if (!validateStep(currentIndex + 1)) {
                return;
            }
            
            // Update step indicators
            steps.forEach((step, index) => {
                if (index <= currentIndex) {
                    step.classList.add('completed');
                }
                if (index === currentIndex + 1) {
                    step.classList.add('active');
                    step.classList.remove('completed');
                }
                if (index < currentIndex + 1) {
                    step.classList.remove('active');
                }
            });
            
            // Hide current section with animation
            currentSection.classList.remove('active');
            setTimeout(() => {
                currentSection.classList.add('hidden');
                
                // Show next section with animation
                sections[currentIndex + 1].classList.remove('hidden');
                setTimeout(() => {
                    sections[currentIndex + 1].classList.add('active');
                }, 50);
                
                // Scroll to top of form
                sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth' });
            }, 300);
            
            // If this is the last step, update summary
            if (currentIndex + 1 === sections.length - 1) {
                updateSummary();
            }
        });
    });
    
    // Previous step buttons
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Find current step
            const currentSection = this.closest('.booking-section');
            const currentIndex = Array.from(sections).indexOf(currentSection);
            
            // Update step indicators
            steps.forEach((step, index) => {
                if (index === currentIndex) {
                    step.classList.remove('active');
                }
                if (index === currentIndex - 1) {
                    step.classList.add('active');
                    step.classList.remove('completed');
                }
            });
            
            // Hide current section with animation
            currentSection.classList.remove('active');
            setTimeout(() => {
                currentSection.classList.add('hidden');
                
                // Show previous section with animation
                sections[currentIndex - 1].classList.remove('hidden');
                setTimeout(() => {
                    sections[currentIndex - 1].classList.add('active');
                }, 50);
                
                // Scroll to top of form
                sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth' });
            }, 300);
        });
    });
}

/**
 * Initialize time slot selection
 */
function initTimeSlotSelection() {
    const timeSlots = document.querySelectorAll('.time-slot');
    const timeSelect = document.getElementById('appointmentTime');
    
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            // Skip if unavailable
            if (this.classList.contains('unavailable')) {
                return;
            }
            
            // Remove selected class from all slots
            timeSlots.forEach(s => s.classList.remove('selected'));
            
            // Add selected class to clicked slot
            this.classList.add('selected');
            
            // Update select element
            if (timeSelect) {
                timeSelect.value = this.textContent.trim();
                
                // Trigger change event for validation
                const event = new Event('change');
                timeSelect.dispatchEvent(event);
            }
            
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

/**
 * Add animation to doctor names in the doctor select
 */
function animateDoctorNames() {
    const doctorSelect = document.getElementById('doctor');
    const doctorPreview = document.getElementById('doctor-preview');
    
    if (!doctorSelect || !doctorPreview) return;
    
    doctorSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value) {
            // Update doctor preview
            doctorPreview.innerHTML = '';
            const doctorName = document.createElement('span');
            doctorName.className = 'doctor-name';
            doctorName.textContent = selectedOption.textContent;
            doctorPreview.appendChild(doctorName);
            
            // Show the preview
            doctorPreview.style.display = 'block';
        } else {
            // Hide the preview if "Any Available Doctor" is selected
            doctorPreview.style.display = 'none';
        }
    });
}