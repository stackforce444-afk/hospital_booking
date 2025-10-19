/**
 * API configuration for Swasthya Setu
 * Defines base URL and common headers for API requests
 */

const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'          // Development API URL through Node.js proxy
    : 'https://api.swasthyasetu.com/api';  // Production API URL

const API_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_BASE_URL,
        API_HEADERS
    };
}