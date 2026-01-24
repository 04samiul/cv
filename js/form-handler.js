/* form-handler.js - Contact Form Processing & Validation */

(function() {
    'use strict';
    
    /**
     * Form Handler Module
     * Manages contact form submission, validation, and Google Apps Script integration
     */
    const FormHandler = {
        form: null,
        submitButton: null,
        feedbackElement: null,
        
        // Replace with your deployed Google Apps Script Web App URL
        scriptURL: 'https://script.google.com/macros/s/AKfycbz8pcoY-ih08U_urEA-qtsz7D0jtjA86da8UBovslzbpXYXPCPK9ePRBjydt_FkzwR8Iw/exec',
        
        /**
         * Initialize form handler
         */
        init: function() {
            this.form = document.getElementById('contactForm');
            this.feedbackElement = document.getElementById('formFeedback');
            
            if (!this.form) {
                console.error('Contact form not found');
                return;
            }
            
            this.submitButton = this.form.querySelector('button[type="submit"]');
            this.attachEventListeners();
        },
        
        /**
         * Attach event listeners to form
         */
        attachEventListeners: function() {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // Real-time validation
            const inputs = this.form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        },
        
        /**
         * Handle form submission
         * @param {Event} e - Form submit event
         */
        handleSubmit: function(e) {
            e.preventDefault();
            
            // Validate all fields
            if (!this.validateForm()) {
                this.showFeedback('Please fix the errors in the form.', 'error');
                return;
            }
            
            // Disable submit button to prevent double submission
            this.setLoading(true);
            
            // Collect form data
            const formData = new FormData(this.form);
            
            // Submit to Google Apps Script
            fetch(this.scriptURL, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.result === 'success') {
                    this.showFeedback('Thank you for your message! I will get back to you soon.', 'success');
                    this.form.reset();
                } else {
                    throw new Error(data.error || 'Submission failed');
                }
            })
            .catch(error => {
                console.error('Form submission error:', error);
                this.showFeedback('There was an error sending your message. Please try again or email me directly at Samiul.chk@gmail.com', 'error');
            })
            .finally(() => {
                this.setLoading(false);
            });
        },
        
        /**
         * Validate entire form
         * @returns {boolean} Form validity
         */
        validateForm: function() {
            const inputs = this.form.querySelectorAll('input[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });
            
            return isValid;
        },
        
        /**
         * Validate individual field
         * @param {HTMLElement} field - Input field to validate
         * @returns {boolean} Field validity
         */
        validateField: function(field) {
            const value = field.value.trim();
            const fieldName = field.name;
            let errorMessage = '';
            
            // Check required fields
            if (field.hasAttribute('required') && !value) {
                errorMessage = `${this.getFieldLabel(field)} is required.`;
            }
            // Validate email format
            else if (fieldName === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errorMessage = 'Please enter a valid email address.';
                }
            }
            // Validate phone format (optional but if provided, should be valid)
            else if (fieldName === 'phone' && value) {
                const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                if (!phoneRegex.test(value) || value.length < 10) {
                    errorMessage = 'Please enter a valid phone number.';
                }
            }
            // Validate message minimum length
            else if (fieldName === 'message' && value && value.length < 10) {
                errorMessage = 'Message must be at least 10 characters long.';
            }
            
            if (errorMessage) {
                this.showFieldError(field, errorMessage);
                return false;
            } else {
                this.clearFieldError(field);
                return true;
            }
        },
        
        /**
         * Show field-specific error
         * @param {HTMLElement} field - Input field
         * @param {string} message - Error message
         */
        showFieldError: function(field, message) {
            this.clearFieldError(field);
            
            field.style.borderColor = '#dc3545';
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.style.color = '#dc3545';
            errorDiv.style.fontSize = '14px';
            errorDiv.style.marginTop = '4px';
            errorDiv.textContent = message;
            
            field.parentElement.appendChild(errorDiv);
        },
        
        /**
         * Clear field error
         * @param {HTMLElement} field - Input field
         */
        clearFieldError: function(field) {
            field.style.borderColor = '';
            
            const errorDiv = field.parentElement.querySelector('.field-error');
            if (errorDiv) {
                errorDiv.remove();
            }
        },
        
        /**
         * Get user-friendly field label
         * @param {HTMLElement} field - Input field
         * @returns {string} Field label
         */
        getFieldLabel: function(field) {
            const label = field.parentElement.querySelector('label');
            if (label) {
                return label.textContent.replace('*', '').trim();
            }
            return field.name.charAt(0).toUpperCase() + field.name.slice(1);
        },
        
        /**
         * Show feedback message
         * @param {string} message - Feedback message
         * @param {string} type - Message type (success/error)
         */
        showFeedback: function(message, type) {
            if (!this.feedbackElement) return;
            
            this.feedbackElement.textContent = message;
            this.feedbackElement.className = `form-feedback ${type}`;
            
            // Auto-hide success messages after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    this.feedbackElement.className = 'form-feedback';
                }, 5000);
            }
        },
        
        /**
         * Set loading state
         * @param {boolean} isLoading - Loading state
         */
        setLoading: function(isLoading) {
            if (!this.submitButton) return;
            
            if (isLoading) {
                this.submitButton.disabled = true;
                this.submitButton.textContent = 'Sending...';
                this.submitButton.style.opacity = '0.6';
            } else {
                this.submitButton.disabled = false;
                this.submitButton.textContent = 'Send Message';
                this.submitButton.style.opacity = '1';
            }
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => FormHandler.init());
    } else {
        FormHandler.init();
    }
})();