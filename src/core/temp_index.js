/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const blessed = require('blessed');
const { Input } = blessed;

// Create command input box
const commandInput = new Input({
    parent: inputContainer,
    top: 0,
    left: 0,
    height: 1,
    width: '100%-1',
    keys: true,
    mouse: true,
    inputOnFocus: true,
    style: theme.styles.input,
    focused: true,
    value: '',
    input: true, // Enable input mode
    inputOnFocus: true, // Focus automatically enables input
    vi: true, // Enable vi-style keybindings
    cursor: {
        artificial: true,
        shape: 'line',
        blink: true,
    },
});

// Add submit handler
commandInput.on('submit', () => {
    const value = commandInput.getValue();
    // ... rest of your submit logic ...
});

// Add keypress handler
commandInput.on('keypress', (ch, key) => {
    if (key.name === 'tab') {
        // ... tab completion logic ...
    }
});
