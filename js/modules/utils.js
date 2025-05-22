/**
 * @file utils.js
 * @description Utility functions for the Modern Table Designer application
 * Contains helper functions and general utilities
 */

/**
 * Throttle function to limit how often a function is called
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    var inThrottle;
    return function() {
        var args = arguments;
        var context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(function() { inThrottle = false; }, limit);
        }
    };
}

/**
 * Updates the price display based on selected options
 * @param {Object} config - The configuration object containing dimensions and material
 * @param {string} config.material - Selected material
 * @param {number} config.width - Table width in cm
 * @param {number} config.length - Table length in cm
 */
function updatePricing() {
    // Base price
    var basePrice = 1500;
    
    // Add material cost
    var selectedMaterial = document.querySelector('.material-item.selected');
    if (selectedMaterial.classList.contains('material-ebene')) {
        basePrice += 300; // Ebony is more expensive
    } else if (selectedMaterial.classList.contains('material-mogano')) {
        basePrice += 200; // Mahogany is more expensive
    }
    
    // Add size cost
    var tableWidth = parseInt(document.querySelector('input[data-dimension="width"]').value);
    var tableLength = parseInt(document.querySelector('input[data-dimension="length"]').value);
    var area = tableWidth * tableLength;
    var standardArea = 109 * 150;
    
    if (area > standardArea) {
        basePrice += Math.round((area - standardArea) * 0.1);
    }
    
    // Calculate features cost
    var featuresPrice = 0;
    document.querySelectorAll('.feature-checkbox:checked').forEach(function(feature) {
        var priceElement = feature.nextElementSibling.querySelector('.feature-price');
        var price = parseInt(priceElement.textContent.replace(/[^\d]/g, ''));
        featuresPrice += price;
    });
    
    // Update the pricing display
    document.querySelector('.pricing-summary .price-row:nth-child(1) .price-value').textContent = `${basePrice} ₺`;
    document.querySelector('.pricing-summary .price-row:nth-child(2) .price-value').textContent = `${featuresPrice} ₺`;
    document.querySelector('.pricing-summary .price-row.total .price-value').textContent = `${basePrice + featuresPrice} ₺`;
}

/**
 * Updates the dimensions label in the UI
 * @param {number} width - Table width in cm
 * @param {number} length - Table length in cm
 */
function updateDimensionsLabel(width, length) {
    var badge = document.querySelector('.dimensions-badge');
    if (badge) {
        badge.textContent = `${width}×${length} cm`;
    }
}

/**
 * Initializes scroll reveal animations
 */
function initScrollReveal() {
    var revealElements = document.querySelectorAll('.reveal');
    
    function revealOnScroll() {
        revealElements.forEach(function(element) {
            var elementTop = element.getBoundingClientRect().top;
            var elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    }
    
    // Apply throttling to scroll events for better performance
    window.addEventListener('scroll', throttle(revealOnScroll, 100));
    
    // Call initially to reveal elements already in view
    revealOnScroll();
}

// Export the module's public API
window.UtilsModule = {
    throttle,
    updatePricing,
    updateDimensionsLabel,
    initScrollReveal
};