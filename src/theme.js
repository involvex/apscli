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
        fg: '#39FF14', // Pure neon green
        bg: '#000000', // Deep black background
        border: '#FFFFFF', // White borders
        error: '#FF0000', // Bright red
        warning: '#FFFF00', // Bright yellow
        success: '#39FF14', // Pure neon green
        prompt: '#39FF14', // Pure neon green
        input: '#39FF14', // Pure neon green
        scrollbar: '#FFFFFF', // White scrollbar
        completion: '#39FF14', // Pure neon green
    },

    // Style configurations for different components
    styles: {
        box: {
            fg: '#39FF14', // Pure neon green text
            bg: '#000000', // Deep black background
            border: {
                fg: '#FFFFFF', // White border
            },
            bold: true, // Make text bold for more visibility
        },
        gauge: {
            fg: '#39FF14', // Pure neon green for gauge
            bg: '#000000', // Deep black background
            border: {
                fg: '#FFFFFF', // White border
            },
        },
        log: {
            fg: '#39FF14', // Pure neon green text
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
            fg: '#39FF14', // Pure neon green text
            bg: '#000000', // Deep black background
            bold: true, // Make text bold for more visibility
        },
        selected: {
            bg: '#39FF14', // Pure neon green background for selected items
            fg: '#000000', // Black text for contrast when selected
            bold: true, // Make text bold for more visibility
        },
    },

    // Text formatting functions using chalk
    text: {
        error: (text) => chalk.hex('#FF0000').bold(text), // Bright red
        warning: (text) => chalk.hex('#FFFF00').bold(text), // Bright yellow
        success: (text) => chalk.hex('#39FF14').bold(text), // Pure neon green
        prompt: (text) => chalk.hex('#39FF14').bold(text), // Pure neon green
        input: (text) => chalk.hex('#39FF14').bold(text), // Pure neon green
        completion: (text) => chalk.hex('#39FF14').bold(text), // Pure neon green
    },
};

module.exports = theme;
