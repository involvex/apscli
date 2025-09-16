/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

/**
 * Safely gets the value from a blessed input/textbox component
 * @param {object} input - The blessed input component
 * @returns {string} The input value or empty string if error
 */
function safeGetValue(input) {
    if (!input) return '';
    try {
        const value = input.getValue();
        return typeof value === 'string' ? value : '';
    } catch (error) {
        console.error('Error getting input value:', error);
        return '';
    }
}

/**
 * Safely sets the value of a blessed input/textbox component
 * @param {object} input - The blessed input component
 * @param {string} value - The value to set
 * @returns {boolean} Whether the operation was successful
 */
function safeSetValue(input, value) {
    if (!input || typeof input.setValue !== 'function') return false;
    try {
        const safeValue = typeof value === 'string' ? value : '';
        // Call the original setValue directly
        input._setValue(safeValue);
        return true;
    } catch (error) {
        console.error('Error setting input value:', error);
        try {
            // Fallback to direct value setting if available
            if (input.value !== undefined) {
                input.value = typeof value === 'string' ? value : '';
            }
        } catch (e) {
            // Ignore fallback errors
        }
        return false;
    }
}

/**
 * Creates a blessed input component with error handling
 * @param {object} blessed - The blessed library
 * @param {object} options - Input component options
 * @returns {object} The created input component
 */
function createSafeInput(blessed, options) {
    const input = blessed.textbox(options);

    // Store original methods
    input._getValue = input.getValue.bind(input);
    input._setValue = input.setValue.bind(input);

    // Override getValue
    input.getValue = function () {
        return safeGetValue(this);
    };

    // Override setValue
    input.setValue = function (value) {
        return safeSetValue(this, value);
    };

    return input;
}

module.exports = {
    safeGetValue,
    safeSetValue,
    createSafeInput,
};
