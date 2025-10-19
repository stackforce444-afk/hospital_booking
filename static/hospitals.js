/**
 * Swasthya Setu - Hospitals Page JavaScript
 * This file contains functionality for the hospitals listing and details
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize hospital cards
    initHospitalCards();
    
    // Load hospital data from API
    loadHospitalData();
    
    // Initialize search and filtering
    initSearchAndFilters();
    
    // Initialize map if available
    initMap();
});

/**
 * Initialize hospital cards with hover effects and click handlers
 */
function initHospitalCards() {
    const hospitalCards = document.querySelectorAll('.hospital-card');
    
    hospitalCards.forEach(card => {
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            this.classList.add('hover');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
        
        // Add click handler for the entire card
        card.addEventListener('click', function(e) {
            // If they didn't click directly on a button or link, navigate to detail page
            if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON') {
                e.preventDefault();
                const hospitalId = this.dataset.id;
                if (hospitalId) {
                    window.location.href = `hospital_detail.html?id=${hospitalId}`;
                }
            }
        });
    });
}

/**
 * Load hospital data from API
 */
function loadHospitalData() {
    // Check if API is available
    if (!window.API_BASE_URL) return;
    
    // Check if we're on the hospital detail page
    const urlParams = new URLSearchParams(window.location.search);
    const hospitalId = urlParams.get('id');
    
    if (hospitalId) {
        // Load single hospital
        loadHospitalDetail(hospitalId);
    } else {
        // Load all hospitals
        fetch(`${window.API_BASE_URL}/hospitals`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data.length > 0) {
                    updateHospitalCards(data.data);
                }
            })
            .catch(error => {
                console.warn('Could not load hospital data from API', error);
            });
    }
}

/**
 * Load hospital detail from API
 */
function loadHospitalDetail(hospitalId) {
    fetch(`${window.API_BASE_URL}/hospitals/${hospitalId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateHospitalDetail(data.data);
            } else {
                showMessage('error', 'Hospital not found');
                setTimeout(() => {
                    window.location.href = 'hospitals.html';
                }, 2000);
            }
        })
        .catch(error => {
            console.warn('Could not load hospital detail from API', error);
            showMessage('error', 'Error loading hospital details');
        });
}

/**
 * Update hospital cards with data from API
 */
function updateHospitalCards(hospitals) {
    const hospitalContainer = document.querySelector('.hospitals-container');
    if (!hospitalContainer) return;
    
    // Clear existing cards if we're replacing them
    if (hospitalContainer.dataset.dynamic === 'true') {
        hospitalContainer.innerHTML = '';
    }
    
    // Only add dynamic cards if we're supposed to
    if (hospitalContainer.dataset.dynamic !== 'true') return;
    
    // Add hospital cards
    hospitals.forEach(hospital => {
        const card = document.createElement('div');
        card.className = 'hospital-card';
        card.dataset.id = hospital._id;
        
        // Create hospital image
        const imgContainer = document.createElement('div');
        imgContainer.className = 'hospital-image';
        
        const img = document.createElement('img');
        img.src = hospital.imageUrl || 'images/hospital-default.jpg';
        img.alt = hospital.name;
        imgContainer.appendChild(img);
        card.appendChild(imgContainer);
        
        // Create hospital info
        const info = document.createElement('div');
        info.className = 'hospital-info';
        
        const name = document.createElement('h3');
        name.textContent = hospital.name;
        info.appendChild(name);
        
        const address = document.createElement('p');
        address.className = 'hospital-address';
        address.textContent = formatAddress(hospital.address);
        info.appendChild(address);
        
        const specialties = document.createElement('p');
        specialties.className = 'hospital-specialties';
        specialties.textContent = `Specialties: ${hospital.specialties.join(', ')}`;
        info.appendChild(specialties);
        
        const rating = document.createElement('div');
        rating.className = 'hospital-rating';
        rating.innerHTML = generateStarRating(hospital.rating);
        info.appendChild(rating);
        
        // Create action buttons
        const actions = document.createElement('div');
        actions.className = 'hospital-actions';
        
        const viewButton = document.createElement('a');
        viewButton.href = `hospital_detail.html?id=${hospital._id}`;
        viewButton.className = 'btn btn-primary';
        viewButton.textContent = 'View Details';
        actions.appendChild(viewButton);
        
        const bookButton = document.createElement('a');
        bookButton.href = `booking_page.html?hospital=${hospital._id}`;
        bookButton.className = 'btn btn-secondary';
        bookButton.textContent = 'Book Appointment';
        actions.appendChild(bookButton);
        
        info.appendChild(actions);
        card.appendChild(info);
        
        // Add to container
        hospitalContainer.appendChild(card);
    });
    
    // Re-initialize cards
    initHospitalCards();
}

/**
 * Update hospital detail page with data from API
 */
function updateHospitalDetail(hospital) {
    // Update page title
    document.title = `${hospital.name} - Swasthya Setu`;
    
    // Update hospital name
    const nameElement = document.querySelector('.hospital-name');
    if (nameElement) {
        nameElement.textContent = hospital.name;
    }
    
    // Update hospital image
    const imageElement = document.querySelector('.hospital-detail-image img');
    if (imageElement) {
        imageElement.src = hospital.imageUrl || 'images/hospital-default.jpg';
        imageElement.alt = hospital.name;
    }
    
    // Update hospital description
    const descriptionElement = document.querySelector('.hospital-description');
    if (descriptionElement) {
        descriptionElement.textContent = hospital.description;
    }
    
    // Update hospital address
    const addressElement = document.querySelector('.hospital-address');
    if (addressElement) {
        addressElement.textContent = formatAddress(hospital.address);
    }
    
    // Update hospital contact
    const contactElement = document.querySelector('.hospital-contact');
    if (contactElement) {
        contactElement.innerHTML = `
            <p><strong>Phone:</strong> ${hospital.contactNumber}</p>
            <p><strong>Email:</strong> ${hospital.email || 'N/A'}</p>
            <p><strong>Website:</strong> ${hospital.website ? `<a href="${hospital.website}" target="_blank">${hospital.website}</a>` : 'N/A'}</p>
        `;
    }
    
    // Update hospital specialties
    const specialtiesElement = document.querySelector('.hospital-specialties');
    if (specialtiesElement && hospital.specialties) {
        specialtiesElement.innerHTML = '';
        
        const specialtiesList = document.createElement('ul');
        hospital.specialties.forEach(specialty => {
            const item = document.createElement('li');
            item.textContent = specialty;
            specialtiesList.appendChild(item);
        });
        
        specialtiesElement.appendChild(specialtiesList);
    }
    
    // Update hospital facilities
    const facilitiesElement = document.querySelector('.hospital-facilities');
    if (facilitiesElement && hospital.facilities) {
        facilitiesElement.innerHTML = '';
        
        const facilitiesList = document.createElement('ul');
        hospital.facilities.forEach(facility => {
            const item = document.createElement('li');
            item.textContent = facility;
            facilitiesList.appendChild(item);
        });
        
        facilitiesElement.appendChild(facilitiesList);
    }
    
    // Update hospital rating
    const ratingElement = document.querySelector('.hospital-rating');
    if (ratingElement) {
        ratingElement.innerHTML = generateStarRating(hospital.rating);
        ratingElement.innerHTML += ` <span class="rating-count">(${hospital.numberOfRatings} reviews)</span>`;
    }
    
    // Update book appointment button
    const bookButton = document.querySelector('.book-appointment-btn');
    if (bookButton) {
        bookButton.href = `booking_page.html?hospital=${hospital._id}`;
    }
    
    // Initialize map with hospital location
    if (hospital.location && hospital.location.coordinates) {
        initMapWithLocation(hospital.location.coordinates[1], hospital.location.coordinates[0], hospital.name);
    }
}

/**
 * Initialize search and filtering functionality
 */
function initSearchAndFilters() {
    // Search functionality
    const searchInput = document.getElementById('hospital-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterHospitals();
        });
    }
    
    // Specialty filter
    const specialtyFilter = document.getElementById('specialty-filter');
    if (specialtyFilter) {
        specialtyFilter.addEventListener('change', function() {
            filterHospitals();
        });
    }
    
    // Rating filter
    const ratingFilter = document.getElementById('rating-filter');
    if (ratingFilter) {
        ratingFilter.addEventListener('change', function() {
            filterHospitals();
        });
    }
}

/**
 * Filter hospitals based on search and filter criteria
 */
function filterHospitals() {
    const searchInput = document.getElementById('hospital-search');
    const specialtyFilter = document.getElementById('specialty-filter');
    const ratingFilter = document.getElementById('rating-filter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const specialty = specialtyFilter ? specialtyFilter.value : '';
    const minRating = ratingFilter ? parseInt(ratingFilter.value) : 0;
    
    const hospitalCards = document.querySelectorAll('.hospital-card');
    
    hospitalCards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const specialties = card.querySelector('.hospital-specialties').textContent.toLowerCase();
        const rating = parseFloat(card.dataset.rating || '0');
        
        // Check if hospital matches all criteria
        const matchesSearch = name.includes(searchTerm) || specialties.includes(searchTerm);
        const matchesSpecialty = specialty === '' || specialties.includes(specialty.toLowerCase());
        const matchesRating = rating >= minRating;
        
        if (matchesSearch && matchesSpecialty && matchesRating) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Initialize map on hospital detail page
 */
function initMap() {
    // Check if map container exists
    const mapContainer = document.getElementById('hospital-map');
    if (!mapContainer) return;
    
    // Check if we're on the hospital detail page
    const urlParams = new URLSearchParams(window.location.search);
    const hospitalId = urlParams.get('id');
    
    if (hospitalId) {
        // Map will be initialized when hospital data is loaded
    } else {
        // Initialize map with default location (center of India)
        initMapWithLocation(20.5937, 78.9629, 'India');
    }
}

/**
 * Initialize map with specific location
 */
function initMapWithLocation(lat, lng, title) {
    const mapContainer = document.getElementById('hospital-map');
    if (!mapContainer) return;
    
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        console.warn('Google Maps API not loaded');
        return;
    }
    
    // Create map
    const map = new google.maps.Map(mapContainer, {
        center: { lat, lng },
        zoom: 15
    });
    
    // Add marker
    new google.maps.Marker({
        position: { lat, lng },
        map,
        title
    });
}

/**
 * Helper function to format address
 */
function formatAddress(address) {
    if (!address) return 'Address not available';
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(address.zipCode);
    if (address.country) parts.push(address.country);
    
    return parts.join(', ');
}

/**
 * Helper function to generate star rating HTML
 */
function generateStarRating(rating) {
    if (!rating) return 'No ratings yet';
    
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let html = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        html += '<span class="star full">★</span>';
    }
    
    // Half star
    if (halfStar) {
        html += '<span class="star half">★</span>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        html += '<span class="star empty">☆</span>';
    }
    
    return html + ` <span class="rating-value">${rating.toFixed(1)}</span>`;
}