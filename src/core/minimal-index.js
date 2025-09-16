/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const blessed = require('blessed');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Import custom modules
const { handleSlashCommand } = require('./slash-commands');
const { loadTheme } = require('../themes/theme-loader.js');
const { getProfileCommands } = require('./powershell-utils.js');
const { createInput } = require('./utils/simple-input');

// Initialize theme
const theme = loadTheme(path.join(process.cwd(), 'src/themes/default.css'));
const themeText = theme.text;

// Create screen
const screen = blessed.screen({
    smartCSR: true,
    title: 'APS CLI',
    dockBorders: true,
    fullUnicode: true,
});

// Create main output log
const outputLog = blessed.log({
    parent: screen,
    top: 0,
    left: 0,
    width: '100%',
    bottom: 3,
    label: 'Terminal Output',
    tags: true,
    border: 'line',
    style: { ...theme.styles.log, bg: '#000000' },
    scrollable: true,
    alwaysScroll: true,
    mouse: true,
});

// Create footer
const footer = blessed.box({
    parent: screen,
    bottom: 0,
    left: 0,
    height: 1,
    width: '100%',
    tags: true,
    style: { ...theme.styles.box, bold: true },
});

// Create command input with safe error handling
const commandInput = createInput(blessed, {
    parent: screen,
    bottom: 1,
    left: 0,
    height: 1,
    width: '100%',
    keys: true,
    mouse: true,
    inputOnFocus: true,
    style: theme.styles.input,
    focused: true,
});

// Update prompt display
async function updatePrompt() {
    const currentPath = process.cwd();
    const promptText = `PS ${currentPath}> `;
    try {
        commandInput.setValue(promptText);
        screen.render();
    } catch (error) {
        console.error('Error updating prompt:', error);
    }
}

// Handle command execution
commandInput.on('submit', async () => {
    try {
        const command = commandInput.getValue()?.trim() || '';
        if (!command) return;

        const promptText = themeText.prompt(`PS ${process.cwd()}>`);
        const cmdText = themeText.input(command);
        outputLog.log(`${promptText} ${cmdText}`);

        if (command.startsWith('/')) {
            const handled = await handleSlashCommand(command, outputLog, themeText);
            if (!handled) {
                outputLog.log(themeText.error(`Unknown slash command: ${command.split(' ')[0]}`));
            }
        } else {
            exec(`powershell -Command "${command}"`, async (error, stdout, stderr) => {
                if (error) {
                    outputLog.log(themeText.error(`Error: ${error.message}`));
                } else if (stderr) {
                    outputLog.log(themeText.warning(stderr));
                } else if (stdout) {
                    outputLog.log(stdout);
                }
                await updatePrompt();
            });
        }

        commandInput.setValue('');
        commandInput.clearValue?.();
        commandInput.focus();
        screen.render();
    } catch (error) {
        outputLog.log(themeText.error(`Error executing command: ${error.message}`));
    }
});

// Cleanup function
const cleanup = () => {
    screen.destroy();
    process.exit(0);
};

// Key bindings
screen.key(['escape', 'q', 'C-c'], cleanup);
commandInput.key(['C-c'], cleanup);

// Initialize
commandInput.focus();
updatePrompt();
screen.render();

// Set footer content
const version = '0.1.0';
footer.setContent(`{center}APSCLI v${version} | Press q to quit{/center}`);

// Keep alive
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.stdin.resume();
