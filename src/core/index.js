/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const blessed = require('blessed');
const si = require('systeminformation');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Import custom modules
const { allCommands } = require('./commands.js');
const { loadSlashCommands, handleSlashCommand } = require('./slash-commands');
const { loadTheme } = require('../themes/theme-loader.js');
const { getProfileCommands } = require('./powershell-utils.js');

const theme = loadTheme(path.join(process.cwd(), 'src/themes/default.css'));
const themeText = theme.text;
const slashCommands = loadSlashCommands();

// Store profile commands
let profileCommands = [];
let lastInfoUpdate = 0;

// Create a screen object
const screen = blessed.screen({
    smartCSR: true,
    title: 'APS CLI - Advanced PowerShell Command Line Interface',
    dockBorders: true,
    fullUnicode: true,
});

// Create header
const header = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: '100%',
    height: 3, // Adjusted height for simple text
    content: 'APSCLI',
    align: 'center',
    valign: 'middle',
    tags: true,
    style: theme.styles.header,
    border: 'line',
});

// Command output log (main terminal output)
const outputLog = blessed.log({
    parent: screen,
    top: 3,
    left: 0,
    width: '75%',
    bottom: 4, // Adjusted bottom to leave space for executed commands, input, and footer
    label: 'Terminal Output',
    tags: true,
    border: 'line',
    style: { ...theme.styles.log, bg: '#000000' }, // Explicitly set background
    scrollable: true,
    alwaysScroll: true,
    maxLines: 1000, // Limit the number of lines to prevent overflow
    scrollbar: {
        style: {
            bg: theme.colors.scrollbar,
        },
    },
    mouse: true,
});

// Executed Command Log (history of commands)
const executedCommandLog = blessed.log({
    parent: screen,
    bottom: 3, // Positioned above input container
    left: 0,
    width: '75%',
    height: 1,
    label: 'Executed Commands',
    style: { ...theme.styles.log, bg: theme.colors.bg }, // Explicitly set background
    tags: true,
    border: 'line',
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
        style: {
            bg: theme.colors.scrollbar,
        },
    },
    mouse: true,
});

// Gauges and info sidebar
const sidebar = blessed.box({
    parent: screen,
    top: 3,
    left: '75%',
    width: '25%',
    bottom: 4, // Adjusted bottom to align with outputLog
    label: 'System Info',
    border: 'line',
    style: theme.styles.box,
});

// CPU Usage gauge (now a simple text box)
const cpuGauge = blessed.box({
    parent: sidebar,
    label: 'CPU Usage',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    style: theme.styles.box,
    border: 'line',
    content: '0%',
});

// Memory gauge (now a simple text box)
const memGauge = blessed.box({
    parent: sidebar,
    label: 'Memory Usage',
    top: 3,
    left: 0,
    right: 0,
    height: 3,
    style: theme.styles.box,
    border: 'line',
    content: '0%',
});

// Network stats
const networkStats = blessed.log({
    parent: sidebar,
    label: 'Network Stats',
    top: 6,
    left: 0,
    right: 0,
    height: 4,
    style: theme.styles.log,
    border: 'line',
});

// Disk usage box
const diskBox = blessed.box({
    parent: sidebar,
    label: 'Disk Usage',
    top: 10,
    left: 0,
    right: 0,
    height: 4,
    style: theme.styles.box,
    border: 'line',
});

// System info log
const sysInfoLog = blessed.log({
    parent: sidebar,
    label: 'System Info',
    top: 14,
    left: 0,
    right: 0,
    bottom: 0,
    style: theme.styles.log,
    border: 'line',
});

// Completion list
const completionList = blessed.list({
    parent: screen,
    bottom: 3, // Positioned above input container
    left: 0,
    width: '100%',
    height: '20%',
    border: 'line',
    style: {
        ...theme.styles.box,
        selected: theme.styles.selected,
    },
    hidden: true,
    keys: true,
    mouse: true,
    vi: true,
});

// Create a container for prompt and input
const inputContainer = blessed.box({
    parent: screen,
    bottom: 1, // Adjusted bottom
    left: 0,
    height: 2, // Adjusted height
    width: '100%',
    style: {
        fg: theme.colors.fg, // Added foreground color
        bg: theme.colors.bg,
    },
});

// Create prompt box for current directory
const promptBox = blessed.box({
    parent: inputContainer,
    top: 0,
    left: 0,
    height: 1,
    width: 'shrink',
    style: {
        fg: theme.colors.fg, // Added foreground color
        bg: theme.colors.bg,
    },
});

// Create command input box
const commandInput = blessed.textbox({
    parent: inputContainer,
    top: 0,
    left: 0, // Initial left position, will be adjusted dynamically
    height: 1,
    width: '100%-1', // Adjusted width
    keys: true,
    mouse: true,
    inputOnFocus: true,
    style: theme.styles.input,
    focused: true, // Ensure input is focused initially
    value: '', // Ensure the input always has a string value
});

// Footer
const footer = blessed.box({
    parent: screen,
    bottom: 0,
    left: 0,
    height: 1,
    width: '100%',
    tags: true,
    style: { ...theme.styles.box, bold: true },
});

const {
    createProgressBar,
    getFileAndFolderCompletions,
    getNpmScriptCompletions,
    stripAnsiCodes,
} = require('./utils/utils.js');

async function getPingLatency(host) {
    return new Promise((resolve) => {
        exec(`ping -n 1 ${host}`, (error, stdout, stderr) => {
            if (error || stderr) {
                resolve('N/A');
                return;
            }
            const match = stdout.match(/Average = (\d+)ms/);
            if (match && match[1]) {
                resolve(parseInt(match[1], 10));
            } else {
                resolve('N/A');
            }
        });
    });
}
// Update system information with throttling
let updateInProgress = false;

async function updateSystemInfo() {
    if (updateInProgress) return;
    updateInProgress = true;

    try {
        // Update in parallel for better performance
        const [cpuLoad, mem, disk, netStats] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.fsSize(),
            si.networkStats(),
        ]);

        // CPU Usage
        cpuGauge.setContent(createProgressBar(Math.round(cpuLoad.currentLoad)));

        // Memory Usage
        const memPercent = Math.round((mem.used / mem.total) * 100);
        memGauge.setContent(createProgressBar(memPercent));

        // Disk Usage
        const mainDisk = disk[0];
        const usedPercent = Math.round((mainDisk.used / mainDisk.size) * 100);

        // Update disk usage with ASCII progress bar
        const usedGB = Math.round(mainDisk.used / 1024 / 1024 / 1024);
        const totalGB = Math.round(mainDisk.size / 1024 / 1024 / 1024);
        const progressBar = createProgressBar(usedPercent);
        diskBox.setContent(
            `  ${mainDisk.mount}` + `  ${progressBar}` + `  (${usedGB}GB / ${totalGB}GB)`
        );

        networkStats.setContent(
            [
                'Down: ' +
                    (netStats?.[0]?.rx_sec?.toFixed(2) ?? 'N/A') +
                    ' KB/s ' +
                    'Up: ' +
                    (netStats?.[0]?.tx_sec?.toFixed(2) ?? 'N/A') +
                    ' KB/s' +
                    '\n' +
                    'Latency: ' +
                    (await getPingLatency('1.1.1.1')) +
                    ' ms',
            ].join('\n'));
        // System Information Log (update less frequently)
        if (!lastInfoUpdate || Date.now() - lastInfoUpdate > 5000) {
            const [cpu, os] = await Promise.all([si.cpu(), si.osInfo()]);
            sysInfoLog.setContent(
                [
                    `Memory Total: ${Math.round(mem.total / 1024 / 1024 / 1024)} GB`,
                    `Memory Free: ${Math.round(mem.free / 1024 / 1024 / 1024)} GB`,
                ].join('\n')
            );
            lastInfoUpdate = Date.now();
        }
        debouncedRender();
        updateInProgress = false;
    } catch (error) {
        if (outputLog) {
            outputLog.log(themeText.error(`Error updating system info: ${error.message}`));
        }
        updateInProgress = false;
    }
}
// Function to update current directory display
async function updatePrompt() {
    const currentPath = process.cwd();
    const promptText = `PS ${currentPath}> `;
    promptBox.setContent(promptText);
    promptBox.width = promptText.length + 1; // Set width to content length + 1 for padding
    commandInput.left = promptBox.width; // Adjust commandInput left based on promptBox width
    debouncedRender();
}
// Setup tab completion
let completionState = {
    current: '',
    index: -1,
    results: [],
    lastInput: '',
};

// Use commands from the commands module
const commonCommands = allCommands;

commandInput.key(['tab'], () => {
    const currentInputValue = commandInput.getValue().trim();

    if (currentInputValue !== completionState.lastInput) {
        completionState.current = currentInputValue;
        completionState.index = -1;

        const parts = currentInputValue.split(' ');
        const command = parts[0];
        const arg = parts.slice(1).join(' '); // The rest of the input after the command

        let fileCompletions = [];
        if (['cd', 'ls', 'dir', 'cat', 'more', 'less', 'type'].includes(command.toLowerCase())) {
            fileCompletions = getFileAndFolderCompletions(arg);
        } else {
            fileCompletions = getFileAndFolderCompletions(currentInputValue);
        }

        const npmCompletions = getNpmScriptCompletions(currentInputValue);
        const profileCmdCompletions = profileCommands.filter((cmd) =>
            cmd.toLowerCase().startsWith(currentInputValue.toLowerCase())
        );

        const cmdCompletions = commonCommands.filter((cmd) =>
            cmd.trim().toLowerCase().startsWith(currentInputValue.toLowerCase())
        );

        completionState.results = [
            ...new Set([
                ...npmCompletions,
                ...profileCmdCompletions,
                ...fileCompletions,
                ...cmdCompletions,
            ]),
        ];
        completionState.lastInput = currentInputValue;
    }
    if (completionState.results.length > 0) {
        completionList.setItems(completionState.results);
        completionList.show();
        debouncedRender();
    } else {
        // No completions found, hide the list
        completionList.hide();
        screen.render();
    }
});

completionList.on('select', (item) => {
    const selectedCommand = item.getText();
    commandInput.setValue(selectedCommand);
    completionList.hide();
    commandInput.focus();
    screen.render();
});

// Handle input changes
commandInput.on('keypress', (ch, key) => {
    if (completionList.visible) {
        if (key.name === 'up' || key.name === 'down') {
            // Allow navigation within the list
            completionList.emit('keypress', ch, key); // Pass keypress to list for navigation
            return;
        } else if (key.name === 'enter') {
            // Select item on enter
            completionList.emit('select', completionList.items[completionList.selected]);
            return;
        }
    }
    if (key.name !== 'tab') {
        completionList.hide();
    }
});


commandInput.on('submit', async () => {
    if (completionList.visible) {
        // If completion list is visible, assume user is trying to select an item
        completionList.emit('select', completionList.items[completionList.selected]);
        return;
    }
    let command = '';
    try {
        command = commandInput.getValue() || '';
    } catch (e) {
        console.error('Error getting input value:', e);
        command = '';
    }
    if (!command) return;

    try {
        const promptText = themeText.prompt(`PS ${process.cwd()}>`);
        const cmdText = themeText.input(command);
        if (outputLog) {
            outputLog.log(`${promptText} ${cmdText}`);
        }
        if (executedCommandLog) {
            executedCommandLog.log(command);
        }

        if (command.startsWith('/')) {
            const handled = await handleSlashCommand(command, outputLog, themeText, slashCommands);
            if (!handled) {
                outputLog.log(themeText.error(`Unknown slash command: ${command.split(' ')[0]}`));
            }
        } else {
            const [cmd, ...args] = command.trim().split(' ');

            // Execute command using systeminformation if it's a special command
            if (cmd.toLowerCase() === 'clear') {
                if (outputLog) {
                    outputLog.setContent('');
                }
            } else if (cmd.toLowerCase() === 'npm-scripts') {
                try {
                    const packagePath = path.join(process.cwd(), 'package.json');
                    if (fs.existsSync(packagePath)) {
                        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                        const scripts = packageJson.scripts || {};
                        outputLog.log(themeText.success('Available npm scripts:'));
                        for (const scriptName in scripts) {
                            outputLog.log(`  ${scriptName}: ${scripts[scriptName]}`);
                        }
                    } else {
                        outputLog.log(
                            themeText.warning('No package.json found in the current directory.')
                        );
                    }
                } catch (err) {
                    outputLog.log(themeText.error(`Error reading package.json: ${err.message}`));
                }
            }
            else {
                // Execute PowerShell command
                exec(`powershell -Command "${command}"`, async (error, stdout, stderr) => {
                    if (outputLog) {
                        outputLog.setContent(''); // Clear content before logging
                    }
                    if (error) {
                        if (outputLog) {
                            outputLog.log(themeText.error(`Error: ${error.message}`));
                        }
                    }
                    else if (stderr) {
                        if (outputLog) {
                            outputLog.log(themeText.warning(stripAnsiCodes(stderr)));
                        }
                    }
                    else if (stdout) {
                        if (outputLog) {
                            outputLog.log(stripAnsiCodes(String(stdout)));
                        }
                    }
                    await updatePrompt();
                    screen.render(); // Explicitly render after logging
                });
            }
        }
    } catch (error) {
        if (outputLog) {
            outputLog.log(themeText.error(`Error: ${error.message}`));
        }
    }

    // Clear input after execution
    try {
        commandInput.setValue(''); // Directly set value to empty string
        // Ensure value is a string before rendering to prevent TypeError
        if (typeof commandInput.value !== 'string') {
            commandInput.value = '';
        }
        commandInput.focus();
    } catch (e) {
        outputLog.log(themeText.error(`Error clearing/focusing input: ${e.message}`));
    }
    screen.render();
});

// Cleanup function to handle shutdown
const cleanup = () => {
    // Clear any intervals
    if (global.updateInterval) {
        clearInterval(global.updateInterval);
    }
    // Destroy the screen
    screen.destroy();
    process.exit(0);
};
// Focus handling
screen.key(['escape', 'q'], cleanup);

// Add Ctrl+C handling to both screen and commandInput
screen.key(['C-c'], cleanup);
commandInput.key(['C-c'], cleanup);
// Initial focus
commandInput.focus();

let renderTimeout;
const debouncedRender = () => {
    if (renderTimeout) {
        clearTimeout(renderTimeout);
    }
    renderTimeout = setTimeout(() => {
        screen.render();
    }, 50); // Debounce by 50ms
};

// Initial prompt update
updatePrompt();

// Render the screen to start the UI
screen.render();

screen.once('render', async () => {
    // Initial update
    updateSystemInfo();

    // Log profile commands after they are loaded
    getProfileCommands().then((commands) => {
        profileCommands = commands;
    });

    // Set footer content
    const packageJson = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    );
    const version = packageJson.version;
    const repoUrl = packageJson.repository.url.replace('git+', '').replace('.git', '');
    footer.setContent(
        `{center}APSCLI v${version} | ${repoUrl} | Hotkeys: q/esc (quit), tab (autocomplete){/center}`
    );

    // Start the update loop
    global.updateInterval = setInterval(updateSystemInfo, 3000);

    // Re-focus command input after everything else has rendered
    commandInput.focus();
});