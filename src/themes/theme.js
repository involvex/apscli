/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

// Import chalk
const chalk = require('chalk');

// Theme configuration
const theme = {
    colors: {
        fg: '#32CD32', // Lime green
        bg: '#000000', // Deep black background
        border: '#FFFFFF', // White borders
        error: '#FF0000', // Bright red
        warning: '#00FF00', // Neon green (brighter)
        success: '#32CD32', // Lime green
        prompt: '#32CD32', // Lime green
        input: '#32CD32', // Lime green
        scrollbar: '#FFFFFF', // White scrollbar
        completion: '#32CD32', // Lime green
    },

    // Style configurations for different components
    styles: {
        box: {
            fg: '#32CD32', // Lime green text
            bg: '#000000', // Deep black background
            border: {
                fg: '#FFFFFF', // White border
            },
            bold: true, // Make text bold for more visibility
        },
        header: {
            fg: 'cyan', // Different color for header
            bg: '#000000',
            border: {
                fg: '#FFFFFF',
            },
            bold: true,
        },
        gauge: {
            label: ['#32CD32'],
            bar: ['#32CD32'],
            bg: '#000000',
            border: {
                fg: '#FFFFFF',
            },
        },
        log: {
            fg: '#32CD32', // Lime green text
            bg: '#000000', // Deep black background
            border: {
                fg: '#FFFFFF', // White border
            },
            scrollbar: {
                bg: '#FFFFFF', // White scrollbar
            },
            bold: true, // Make text bold for more visibility
        },
        input: {
            fg: '#32CD32', // Lime green text
            bg: '#000000', // Deep black background
            bold: true, // Make text bold for more visibility
            focus: {
                fg: '#000000', // Black text when focused
                bg: '#32CD32', // Lime green background when focused
            },
        },
        selected: {
            bg: '#32CD32', // Lime green background for selected items
            fg: '#000000', // Black text for contrast when selected
            bold: true, // Make text bold for more visibility
        },
    },

    // Text formatting functions using chalk
    text: {
        // Ensure each function returns a string if chalk fails
        error: (text) => {
            try {
                return chalk.hex('#FF0000').bold(text);
            } catch (e) {
                console.error('Chalk error:', e);
                return text;
            }
        },
        // error: (text) => chalk.hex('#FF0000').bold(text), // Bright red
        warning: (text) => {
            try {
                return chalk.hex('#00FF00').bold(text);
            } catch (e) {
                return text;
            }
        },
        success: (text) => {
            try {
                return chalk.hex('#32CD32').bold(text);
            } catch (e) {
                return text;
            }
        },
        prompt: (text) => {
            try {
                return chalk.hex('#32CD32').bold(text);
            } catch (e) {
                return text;
            }
        },
        input: (text) => {
            try {
                return chalk.hex('#32CD32').bold(text);
            } catch (e) {
                return text;
            }
        },
        completion: (text) => {
            try {
                return chalk.hex('#32CD32').bold(text);
            } catch (e) {
                return text;
            }
        },
    },
};

module.exports = theme;
