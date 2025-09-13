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
        fg: '#31f318', // Lime green
        bg: '#000000', // Deep black background
        border: '#0018f5', // White borders
        error: '#FF0000', // Bright red
        warning: '#FFFF00', // Bright yellow
        success: '#32CD32', // Lime green
        prompt: '#32CD32', // Lime green
        input: '#000000', // Lime green
        scrollbar: '#73ff00', // White scrollbar
        completion: '#32CD32', // Lime green
        text: '#6df85aff', // Lime green text
        fontcolor: '#6df85aff',
        header: '#49f732ff',
    },

    // Style configurations for different components
    styles: {
        box: {
            fg: '#3cff00', // Lime green text
            bg: '#000000', // Deep black background
            border: {
                fg: '#2bff00',
                bg: '#000000', // White border
            },
            bold: true, // Make text bold for more visibility
        },
        gauge: {
            label: ['#32CD32'],
            bar: ['#32CD32'],
            bg: '#000000',
            border: {
                fg: '#09ec1c',
            },
        },
        log: {
            fg: '#32CD32', // Lime green text
            bg: '#000000', // Deep black background
            border: {
                fg: '#22ff04', // White border
            },
            scrollbar: {
                bg: '#1eff00', // White scrollbar
            },
            bold: true, // Make text bold for more visibility
        },
        input: {
            fg: '#3cff00', // Lime green text
            bg: '#000000', // Deep black background
            bold: true, // Make text bold for more visibility
        },
        selected: {
            bg: '#32CD32', // Lime green background for selected items
            fg: '#000000', // Black text for contrast when selected
            bold: true, // Make text bold for more visibility
        },
        output: {
            bg: '#000000', // Deep black background
            fg: '#32CD32', // Lime green text
            border: {
                fg: '#22ff04', // White border
            },
            bold: true,
        },
    },

    // Text formatting functions using chalk
    text: {
        error: (text) => chalk.hex('#FF0000').bold(text), // Bright red
        warning: (text) => chalk.hex('#FFFF00').bold(text), // Bright yellow
        success: (text) => chalk.hex('#32CD32').bold(text), // Lime green
        prompt: (text) => chalk.hex('#32CD32').bold(text), // Lime green
        input: (text) => chalk.hex('#32CD32').bold(text), // Lime green
        completion: (text) => chalk.hex('#32CD32').bold(text), // Lime green
    },
};

module.exports = theme;
