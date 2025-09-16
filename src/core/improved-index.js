/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const blessed = require('blessed');
// System monitoring will be added later
// const si = require('systeminformation');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Import custom modules
const { handleSlashCommand } = require('./slash-commands');
const { loadTheme } = require('../themes/theme-loader.js');
const { getProfileCommands } = require('./powershell-utils.js');
const { createSafeInput, safeGetValue, safeSetValue } = require('./utils/input-handler');

const theme = loadTheme(path.join(process.cwd(), 'src/themes/default.css'));
const themeText = theme.text;

const screen = blessed.screen({
    smartCSR: true,
    title: 'APS CLI - Advanced PowerShell Command Line Interface',
    dockBorders: true,
    fullUnicode: true,
});

const header = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    content: 'APSCLI',
    align: 'center',
    valign: 'middle',
    tags: true,
    style: theme.styles.header,
    border: 'line',
});

const outputLog = blessed.log({
    parent: screen,
    top: 3,
    left: 0,
    width: '75%',
    bottom: 4,
    label: 'Terminal Output',
    tags: true,
    border: 'line',
    style: { ...theme.styles.log, bg: '#000000' },
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
        style: {
            bg: theme.colors.scrollbar,
        },
    },
    mouse: true,
});

const commandInput = createSafeInput(blessed, {
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
    value: '',
});

commandInput.on('submit', async () => {
    try {
        const command = safeGetValue(commandInput) || '';
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

        safeSetValue(commandInput, '');
        commandInput.clearValue?.();
        commandInput.focus();
        screen.render();
    } catch (error) {
        outputLog.log(themeText.error(`Error executing command: ${error.message}`));
    }
});

// Update prompt display
async function updatePrompt() {
    const currentPath = process.cwd();
    const promptText = `PS ${currentPath}> `;
    try {
        safeSetValue(commandInput, promptText);
        screen.render();
    } catch (error) {
        console.error('Error updating prompt:', error);
    }
}

const cleanup = () => {
    if (global.updateInterval) {
        clearInterval(global.updateInterval);
    }
    screen.destroy();
    process.exit(0);
};

screen.key(['escape', 'q', 'C-c'], cleanup);
commandInput.key(['C-c'], cleanup);

commandInput.focus();
updatePrompt(); // Initial prompt update
screen.render();

screen.once('render', async () => {
    getProfileCommands().then((commands) => {});

    const packageJson = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    );
    const version = packageJson.version;
    const repoUrl = packageJson.repository.url.replace('git+', '').replace('.git', '');
    footer.setContent(
        `{center}APSCLI v${version} | ${repoUrl} | Hotkeys: q/esc (quit), tab (autocomplete){/center}`
    );

    screen.render();
});

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.stdin.resume();
