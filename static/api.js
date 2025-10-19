/**
 * API client for Swasthya Setu backend
 */

// Import API base URL from api_config.js if available, otherwise use default
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';
window.API_BASE_URL = API_BASE_URL;

// Helper function for making API requests
async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add body data for POST/PUT requests
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        // For development, simulate successful responses
        if (window.MOCK_API === true) {
            return mockApiResponse(endpoint, method, data);
        }

        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
            const response = await fetch(url, { ...options, signal: controller.signal });
            clearTimeout(timeoutId);
            
            // Handle 401 Unauthorized errors (token expired)
            if (response.status === 401 && token) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Only redirect if not already on login page
                if (!window.location.href.includes('login.html')) {
                    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
                    return null;
                }
            }
            
            // Handle network errors
            if (!response.ok) {
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || 'Server error';
                } catch (e) {
                    errorMessage = 'Unable to connect to server';
                }
                throw new Error(errorMessage);
            }
            
            // Parse JSON response
            try {
                const result = await response.json();
                return result;
            } catch (e) {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. Please try again.');
            }
            throw error;
        }
    } catch (error) {
        console.error('API request error:', error);
        
        // For development, return mock data on error
        if (window.MOCK_API === true) {
            return mockApiResponse(endpoint, method, data);
        }
        
        throw error;
    }
}

// Disable mock API by default - use real API calls
window.MOCK_API = false;

// Mock API responses for development
function mockApiResponse(endpoint, method, data) {
    console.log(`Mock API: ${method} ${endpoint}`, data);
    
    // Auth endpoints
    if (endpoint === '/login' && method === 'POST') {
        return {
            access_token: 'mock_token_12345',
            user: {
                id: 1,
                name: 'Test User',
                email: data.email,
                phone: '9876543210',
                gender: 'male'
            }
        };
    }
    
    if (endpoint === '/register' && method === 'POST') {
        return {
            message: 'User registered successfully'
        };
    }
    
    if (endpoint === '/verify-token') {
        return { valid: true };
    }
    
    // Hospitals endpoints
    if (endpoint === '/hospitals' && method === 'GET') {
        return [
            { id: 1, name: 'Care Hospital', address: '123 Health Avenue, Medical District, City' },
            { id: 2, name: 'KIMS Hospital', address: '456 Wellness Road, Healthcare Zone, City' },
            { id: 3, name: 'Apollo Hospital', address: '789 Medical Park, Healing Center, City' },
            { id: 4, name: 'Sunshine Hospital', address: '101 Recovery Street, Wellness District, City' }
        ];
    }
    
    if (endpoint.startsWith('/hospitals/') && endpoint.endsWith('/doctors')) {
        return [
            { id: 1, name: 'Dr. Rajesh Kumar', hospital_id: 1, specialization: 'Cardiology' },
            { id: 2, name: 'Dr. Priya Sharma', hospital_id: 1, specialization: 'Neurology' },
            { id: 3, name: 'Dr. Amit Patel', hospital_id: 1, specialization: 'Nephrology' },
            { id: 4, name: 'Dr. Sunita Verma', hospital_id: 2, specialization: 'Pulmonology' },
            { id: 5, name: 'Dr. Rahul Gupta', hospital_id: 2, specialization: 'Hepatology' }
        ].filter(doctor => doctor.hospital_id === parseInt(endpoint.split('/')[2]));
    }
    
    // Services endpoints
    if (endpoint === '/services' && method === 'GET') {
        return [
            { id: 1, name: 'Cardiology', description: 'Heart care services' },
            { id: 2, name: 'Neurology', description: 'Brain and nervous system care' },
            { id: 3, name: 'Nephrology', description: 'Kidney care services' },
            { id: 4, name: 'Pulmonology', description: 'Lung care services' },
            { id: 5, name: 'Hepatology', description: 'Liver care services' }
        ];
    }
    
    if (endpoint.startsWith('/services/') && endpoint.endsWith('/doctors')) {
        const serviceId = parseInt(endpoint.split('/')[2]);
        const serviceDoctorMap = {
            1: [1, 2], // Cardiology doctors
            2: [2, 5], // Neurology doctors
            3: [3, 4], // Nephrology doctors
            4: [4],    // Pulmonology doctors
            5: [5]     // Hepatology doctors
        };
        
        const doctorIds = serviceDoctorMap[serviceId] || [];
        
        return [
            { id: 1, name: 'Dr. Rajesh Kumar', hospital_id: 1, specialization: 'Cardiology' },
            { id: 2, name: 'Dr. Priya Sharma', hospital_id: 1, specialization: 'Neurology' },
            { id: 3, name: 'Dr. Amit Patel', hospital_id: 1, specialization: 'Nephrology' },
            { id: 4, name: 'Dr. Sunita Verma', hospital_id: 2, specialization: 'Pulmonology' },
            { id: 5, name: 'Dr. Rahul Gupta', hospital_id: 2, specialization: 'Hepatology' }
        ].filter(doctor => doctorIds.includes(doctor.id));
    }
    
    // Appointments endpoints
    if (endpoint === '/appointments' && method === 'POST') {
        return {
            message: 'Appointment booked successfully',
            appointment_id: 'APT' + Math.floor(Math.random() * 10000)
        };
    }
    
    if (endpoint === '/appointments' && method === 'GET') {
        return {
            appointments: [
                {
                    id: 'APT1234',
                    hospital: 'Care Hospital',
                    service: 'Cardiology',
                    doctor: 'Dr. Rajesh Kumar',
                    date: '2023-12-15',
                    time: '10:00 AM',
                    status: 'confirmed'
                },
                {
                    id: 'APT5678',
                    hospital: 'KIMS Hospital',
                    service: 'Neurology',
                    doctor: 'Dr. Priya Sharma',
                    date: '2023-12-20',
                    time: '11:30 AM',
                    status: 'pending'
                }
            ]
        };
    }
    
    if (endpoint.startsWith('/appointments/available-slots')) {
        return {
            available_slots: [
                { time: '09:30 AM' },
                { time: '10:00 AM' },
                { time: '10:30 AM' },
                { time: '12:00 PM' },
                { time: '12:30 PM' },
                { time: '02:30 PM' },
                { time: '03:00 PM' },
                { time: '03:30 PM' },
                { time: '04:00 PM' },
                { time: '05:00 PM' },
                { time: '05:30 PM' }
            ],
            unavailable_slots: [
                { time: '09:00 AM' },
                { time: '11:00 AM' },
                { time: '11:30 AM' },
                { time: '02:00 PM' },
                { time: '04:30 PM' }
            ]
        };
    }
    
    // Default response
    return { message: 'Mock API response' };
}

// Auth API
const AuthAPI = {
    register: (userData) => apiRequest('/register', 'POST', userData),
    login: (credentials) => apiRequest('/login', 'POST', credentials),
    getProfile: () => apiRequest('/profile'),
    updateProfile: (userData) => apiRequest('/profile', 'PUT', userData),
    verifyToken: (token) => apiRequest('/verify-token')
};

// Hospitals API
const HospitalsAPI = {
    getAll: () => apiRequest('/hospitals'),
    getById: (id) => apiRequest(`/hospitals/${id}`),
    getDoctors: (hospitalId) => apiRequest(`/hospitals/${hospitalId}/doctors`)
};

// Services API
const ServicesAPI = {
    getAll: () => apiRequest('/services'),
    getById: (id) => apiRequest(`/services/${id}`),
    getDoctors: (serviceId) => apiRequest(`/services/${serviceId}/doctors`)
};

// Appointments API
const AppointmentsAPI = {
    create: (appointmentData) => apiRequest('/appointments', 'POST', appointmentData),
    getUserAppointments: () => apiRequest('/appointments'),
    getAvailableSlots: (date, hospitalId, serviceId, doctorId) => 
        apiRequest(`/appointments/available-slots?date=${date}&hospital=${hospitalId}&service=${serviceId}${doctorId ? `&doctor=${doctorId}` : ''}`)
};

// Doctors API
const DoctorsAPI = {
    getAll: () => apiRequest('/doctors'),
    getById: (id) => apiRequest(`/doctors/${id}`),
    getAvailability: (doctorId, date) => apiRequest(`/doctors/${doctorId}/availability?date=${date}`)
};

// Export API modules
window.SwasthyaSetuAPI = {
    Auth: AuthAPI,
    Hospitals: HospitalsAPI,
    Services: ServicesAPI,
    Appointments: AppointmentsAPI,
    Doctors: DoctorsAPI
};