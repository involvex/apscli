/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

function createInput(blessed, options) {
    // Create a basic textbox
    const input = blessed.textbox({
        ...options,
        keys: true,
        mouse: true,
        inputOnFocus: true,
        wrap: false,
        height: 1,
    });

    // Add basic error handling to getValue
    const safeGetValue = () => {
        try {
            return input.value || '';
        } catch (error) {
            console.error('Error getting input value:', error);
            return '';
        }
    };

    // Add basic error handling to setValue
    const safeSetValue = (value) => {
        try {
            input.value = value || '';
            input.screen.render();
            return true;
        } catch (error) {
            console.error('Error setting input value:', error);
            return false;
        }
    };

    // Override methods with safe versions
    input.getValue = safeGetValue;
    input.setValue = safeSetValue;

    return input;
}

module.exports = { createInput };
