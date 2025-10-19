// Show message with specified type
function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('login-message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${type} show`;
    }
}

// Setup token refresh mechanism
function setupTokenRefresh() {
    if (TOKEN_REFRESH.timeoutId) {
        clearTimeout(TOKEN_REFRESH.timeoutId);
    }
    
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    if (!tokenExpiry) return;
    
    const expiryTime = new Date(tokenExpiry);
    const now = new Date();
    const timeUntilRefresh = expiryTime.getTime() - now.getTime() - TOKEN_REFRESH.refreshThreshold;
    
    if (timeUntilRefresh > 0) {
        TOKEN_REFRESH.timeoutId = setTimeout(async () => {
            try {
                const verifyResponse = await fetch(`${API_BASE_URL}/verify-token`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!verifyResponse.ok) throw new Error('Token invalid');
                
                const response = await fetch(`${API_BASE_URL}/refresh-token`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!response.ok) throw new Error('Token refresh failed');
                
                const data = await response.json();
                localStorage.setItem('token', data.access_token);
                const newExpiry = new Date();
                newExpiry.setSeconds(newExpiry.getSeconds() + data.expires_in);
                localStorage.setItem('tokenExpiry', newExpiry.toISOString());
                
                setupTokenRefresh();
            } catch (error) {
                console.error('Token refresh error:', error);
                showTokenRefreshDialog();
            }
        }, timeUntilRefresh);
    } else {
        showTokenRefreshDialog();
    }
}

// Show token refresh dialog
function showTokenRefreshDialog() {
    let dialog = document.querySelector('.token-refresh-overlay');
    if (!dialog) {
        dialog = document.createElement('div');
        dialog.className = 'token-refresh-overlay';
        dialog.innerHTML = `
            <div class="token-refresh-dialog">
                <p>Your session is about to expire. Would you like to extend it?</p>
                <button class="refresh">Yes, extend session</button>
                <button class="logout">No, log out</button>
            </div>
        `;
        document.body.appendChild(dialog);
        
        dialog.querySelector('.refresh').addEventListener('click', async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/refresh-token`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!response.ok) throw new Error('Token refresh failed');
                
                const data = await response.json();
                localStorage.setItem('token', data.access_token);
                const newExpiry = new Date();
                newExpiry.setHours(newExpiry.getHours() + 1);
                localStorage.setItem('tokenExpiry', newExpiry.toISOString());
                
                dialog.classList.remove('show');
                setupTokenRefresh();
            } catch (error) {
                console.error('Token refresh error:', error);
                handleLogout();
            }
        });
        
        dialog.querySelector('.logout').addEventListener('click', handleLogout);
    }
    dialog.classList.add('show');
}

// Handle logout
function handleLogout(event) {
    if (event) event.preventDefault();
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    
    localStorage.removeItem('loginRateLimit');
    RATE_LIMIT.attempts = 0;
    RATE_LIMIT.resetTime = null;
    
    if (TOKEN_REFRESH.timeoutId) clearTimeout(TOKEN_REFRESH.timeoutId);
    
    window.location.href = 'index.html';
}

// Verify token with backend
async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/verify-token`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Token verification failed');
    } catch (error) {
        console.error('Token verification error:', error);
        handleLogout();
    }
}

// Setup password validation for registration
function setupPasswordValidation() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const hasUpperCase = /[A-Z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            const isLongEnough = password.length >= 8;
            
            if (document.getElementById('length-check')) {
                document.getElementById('length-check').className = isLongEnough ? 'valid' : '';
                document.getElementById('uppercase-check').className = hasUpperCase ? 'valid' : '';
                document.getElementById('number-check').className = hasNumber ? 'valid' : '';
                document.getElementById('special-check').className = hasSpecial ? 'valid' : '';
            }
        });
    }
    
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            this.style.borderColor = (this.value === passwordInput.value) ? '#4CAF50' : '#f44336';
        });
    }
}

// Initialize all auth-related scripts
function initAuthScripts() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    setupPasswordValidation();
    
    setupTokenRefresh();
    
    const token = localStorage.getItem('token');
    if (token) {
        verifyToken(token);
    }
    
    updateRateLimitUI();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initAuthScripts);

// Setup token refresh on window load as well (optional)
window.addEventListener('load', setupTokenRefresh);

// Logout link handler (if exists)
document.getElementById('logoutLink')?.addEventListener('click', handleLogout);

// Close token refresh dialog on outside click
document.addEventListener('click', function(event) {
    const dialog = document.querySelector('.token-refresh-overlay');
    if (dialog && !dialog.contains(event.target)) {
        dialog.classList.remove('show');
    }
});

// Close token refresh dialog on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dialog = document.querySelector('.token-refresh-overlay');
        if (dialog) {
            dialog.classList.remove('show');
        }
    }
});
