// Application State
let currentModal = null;

// Mock Data for Authentication
const mockUsers = {
    'sarah_j': {
        id: 'intern_demo',
        username: 'sarah_j',
        password: 'password123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com'
    }
};

const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');

// Utility Functions
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
}

function getPasswordStrength(password) {
    const validation = validatePassword(password);
    const score = Object.values(validation).filter(Boolean).length;
    
    if (score === 0) return { strength: 0, text: 'Enter a password', color: '#e5e7eb' };
    if (score <= 2) return { strength: 25, text: 'Weak password', color: '#ef4444' };
    if (score <= 3) return { strength: 50, text: 'Fair password', color: '#f59e0b' };
    if (score <= 4) return { strength: 75, text: 'Good password', color: '#3b82f6' };
    return { strength: 100, text: 'Strong password', color: '#10b981' };
}

function updatePasswordStrength(password) {
    const { strength, text, color } = getPasswordStrength(password);
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (strengthFill && strengthText) {
        strengthFill.style.width = strength + '%';
        strengthFill.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    }
}

// Modal Functions
function showModal(modalId) {
    closeModal(); // Close any existing modal first
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        currentModal = modalId;
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    if (currentModal) {
        const modal = document.getElementById(currentModal);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    currentModal = null;
    document.body.style.overflow = 'auto';
}

function showLogin() {
    showModal('login-modal');
}

function showSignup() {
    showModal('signup-modal');
}

function switchToSignup() {
    closeModal();
    showSignup();
}

function switchToLogin() {
    closeModal();
    showLogin();
}

// Authentication Functions
function login(username, password) {
    // Check mock users first
    const mockUser = mockUsers[username];
    if (mockUser && mockUser.password === password) {
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        return mockUser;
    }
    
    // Check registered users
    const registeredUser = registeredUsers[username];
    if (registeredUser && registeredUser.password === password) {
        localStorage.setItem('currentUser', JSON.stringify(registeredUser));
        return registeredUser;
    }
    
    return null;
}

function signup(userData) {
    const { username, email, password, firstName, lastName } = userData;
    
    // Check if username already exists
    if (mockUsers[username] || registeredUsers[username]) {
        return { success: false, error: 'Username already exists' };
    }
    
    // Check if email already exists
    const existingEmail = Object.values(registeredUsers).find(user => user.email === email);
    if (existingEmail) {
        return { success: false, error: 'Email address already registered' };
    }
    
    // Create new user
    const newUser = {
        id: 'user_' + Date.now(),
        username,
        email,
        password,
        firstName,
        lastName
    };
    
    // Save to registered users
    registeredUsers[username] = newUser;
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    return { success: true, user: newUser };
}

function proceedToDashboard() {
    // Redirect to main dashboard
    window.location.href = 'index.html';
}

// Password Toggle Function
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Form Validation
function validateSignupForm(formData) {
    const errors = [];
    
    if (!formData.firstName.trim()) {
        errors.push('First name is required');
    }
    
    if (!formData.lastName.trim()) {
        errors.push('Last name is required');
    }
    
    if (!validateEmail(formData.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!formData.username.trim()) {
        errors.push('Username is required');
    } else if (formData.username.length < 3) {
        errors.push('Username must be at least 3 characters long');
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.length) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!passwordValidation.lowercase || !passwordValidation.uppercase) {
        errors.push('Password must contain both uppercase and lowercase letters');
    }
    if (!passwordValidation.number) {
        errors.push('Password must contain at least one number');
    }
    
    if (formData.password !== formData.confirmPassword) {
        errors.push('Passwords do not match');
    }
    
    return errors;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        proceedToDashboard();
        return;
    }
    
    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;
            
            if (!username || !password) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            const user = login(username, password);
            if (user) {
                showToast(`Welcome back, ${user.firstName}!`);
                closeModal();
                setTimeout(() => {
                    proceedToDashboard();
                }, 1000);
            } else {
                showToast('Invalid username or password', 'error');
            }
        });
    }
    
    // Signup Form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                firstName: document.getElementById('signup-firstname').value.trim(),
                lastName: document.getElementById('signup-lastname').value.trim(),
                email: document.getElementById('signup-email').value.trim(),
                username: document.getElementById('signup-username').value.trim(),
                password: document.getElementById('signup-password').value,
                confirmPassword: document.getElementById('signup-confirm-password').value
            };
            
            const errors = validateSignupForm(formData);
            if (errors.length > 0) {
                showToast(errors[0], 'error');
                return;
            }
            
            const result = signup(formData);
            if (result.success) {
                localStorage.setItem('currentUser', JSON.stringify(result.user));
                closeModal();
                showModal('success-modal');
            } else {
                showToast(result.error, 'error');
            }
        });
    }
    
    // Password Strength Indicator
    const signupPassword = document.getElementById('signup-password');
    if (signupPassword) {
        signupPassword.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }
    
    // Real-time Username Validation
    const signupUsername = document.getElementById('signup-username');
    if (signupUsername) {
        signupUsername.addEventListener('blur', function() {
            const username = this.value.trim();
            if (username && (mockUsers[username] || registeredUsers[username])) {
                this.style.borderColor = '#ef4444';
                showToast('Username already exists', 'error');
            } else if (username) {
                this.style.borderColor = '#10b981';
            }
        });
        
        signupUsername.addEventListener('input', function() {
            this.style.borderColor = '#e5e7eb';
        });
    }
    
    // Real-time Email Validation
    const signupEmail = document.getElementById('signup-email');
    if (signupEmail) {
        signupEmail.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !validateEmail(email)) {
                this.style.borderColor = '#ef4444';
                showToast('Please enter a valid email address', 'error');
            } else if (email) {
                const existingEmail = Object.values(registeredUsers).find(user => user.email === email);
                if (existingEmail) {
                    this.style.borderColor = '#ef4444';
                    showToast('Email address already registered', 'error');
                } else {
                    this.style.borderColor = '#10b981';
                }
            }
        });
        
        signupEmail.addEventListener('input', function() {
            this.style.borderColor = '#e5e7eb';
        });
    }
    
    // Password Confirmation Validation
    const confirmPassword = document.getElementById('signup-confirm-password');
    if (confirmPassword && signupPassword) {
        function checkPasswordMatch() {
            if (confirmPassword.value && signupPassword.value !== confirmPassword.value) {
                confirmPassword.style.borderColor = '#ef4444';
            } else if (confirmPassword.value) {
                confirmPassword.style.borderColor = '#10b981';
            }
        }
        
        confirmPassword.addEventListener('input', checkPasswordMatch);
        signupPassword.addEventListener('input', checkPasswordMatch);
    }
    
    // Modal Close Events
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    // Escape Key to Close Modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && currentModal) {
            closeModal();
        }
    });
    
    // Remember Me Functionality
    const rememberMe = document.getElementById('remember-me');
    const loginUsername = document.getElementById('login-username');
    
    if (rememberMe && loginUsername) {
        // Load remembered username
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        if (rememberedUsername) {
            loginUsername.value = rememberedUsername;
            rememberMe.checked = true;
        }
        
        // Save username when remember me is checked
        loginForm.addEventListener('submit', function() {
            if (rememberMe.checked) {
                localStorage.setItem('rememberedUsername', loginUsername.value);
            } else {
                localStorage.removeItem('rememberedUsername');
            }
        });
    }
    
    // Animated Stats Counter
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const finalValue = target.textContent;
                    const numericValue = parseInt(finalValue.replace(/\D/g, ''));
                    const suffix = finalValue.replace(/\d/g, '');
                    
                    let current = 0;
                    const increment = numericValue / 50;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= numericValue) {
                            current = numericValue;
                            clearInterval(timer);
                        }
                        target.textContent = Math.floor(current) + suffix;
                    }, 30);
                    
                    observer.unobserve(target);
                }
            });
        });
        
        statNumbers.forEach(stat => observer.observe(stat));
    }
    
    // Initialize animations
    animateStats();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Export functions for global access
window.showLogin = showLogin;
window.showSignup = showSignup;
window.switchToLogin = switchToLogin;
window.switchToSignup = switchToSignup;
window.closeModal = closeModal;
window.togglePassword = togglePassword;
window.proceedToDashboard = proceedToDashboard;