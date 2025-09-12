/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const blessed = require('blessed'); // Create header with simp// CPU Usage gauge
const contrib = require('blessed-contrib');
const si = require('systeminformation');
const chalk = require('chalk');
const figlet = require('figlet');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Import custom modules
const { allCommands } = require('./commands.js');
const theme = require('./theme.js');
const { getProfileCommands } = require('./powershell-utils.js');

// Initialize theme text functions
const { text: themeText } = theme;

// Store profile commands
let profileCommands = [];

// Create a screen object
const screen = blessed.screen({
    smartCSR: true,
    title: 'APS CLI - Advanced PowerShell Command Line Interface',
    dockBorders: true,
    fullUnicode: true,
});

// Create a grid layout
const grid = new contrib.grid({
    rows: 12,
    cols: 12,
    screen: screen,
});

// Create header with simple text for now
const header = grid.set(0, 0, 2, 12, blessed.box, {
    content: 'APS CLI - Advanced PowerShell Command Line Interface', // Simple text for header
    align: 'center', // Center the text horizontally
    valign: 'middle', // Center the text vertically
    tags: true, // Enable tags for styling
    style: {
        fg: '#00FF00', // Pure neon green text
        bg: '#000000', // Deep black background
        border: {
            fg: '#FFFFFF', // White border
        },
        bold: true, // Make text bold
        FontSize: 10,
    },
    border: 'line', // Add border around the header
    padding: {
        // Add padding for better appearance
        top: 0,
        left: 2,
        right: 2,
    },
});

// CPU Usage gauge
const cpuGauge = grid.set(2, 0, 3, 3, contrib.gauge, {
    label: 'CPU Usage',
    showLabel: true,
    style: {
        fg: 'green',
        label: ['green'],
        bar: ['green'],
        bg: 'black',
        padding: { top: 0, bottom: 0 },
    },
    percent: [80],
    data: [80],
});

// Memory gauge
const memGauge = grid.set(2, 3, 3, 3, contrib.gauge, {
    label: 'Memory Usage',
    showLabel: true,
    style: {
        fg: 'green',
        label: ['green'],
        bar: ['green'],
        bg: 'black',
        padding: { top: 0, bottom: 0 },
    },
    percent: [60],
    data: [60],
});

const gpuGauge = grid.set(2, 6, 3, 3, contrib.gauge, {
    label: 'GPU Usage',
    showLabel: true,
    style: {
        fg: 'green',
        label: ['green'],
        bar: ['green'],
        bg: 'black',
        padding: { top: 0, bottom: 0 },
    },
    percent: [40],
    data: [40],
});

const networkStats = grid.set(2, 9, 6, 3, blessed.log, {
    label: 'Network Stats',
    style: theme.styles.log,
    border: 'line',
    scrollable: true,
    scrollbar: {
        style: {
            bg: theme.colors.scrollbar,
        },
    },
    mouse: true,
});

// Disk usage box
const diskBox = grid.set(4, 0, 2, 6, blessed.box, {
    label: 'Disk Usage',
    style: theme.styles.box,
});

// System info log
const sysInfoLog = grid.set(4, 6, 3, 6, blessed.log, {
    label: 'System Info',
    style: theme.styles.log,
    border: 'line',
    scrollable: true,
    scrollbar: {
        style: {
            bg: theme.colors.scrollbar,
        },
    },
    mouse: true,
});

// Command output log (appears below input)
const commandLog = blessed.log({
    parent: screen,
    bottom: 0,
    left: 0,
    height: '30%',
    width: '100%',
    label: 'Command Output',
    tags: true,
    style: {
        ...theme.styles.log,
        border: {
            fg: theme.colors.border,
        },
    },
    border: 'line',
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
        style: {
            bg: theme.colors.scrollbar,
        },
    },
    mouse: true,
    hidden: true, // Initially hidden
});
const outputLog = blessed.log({
    // This is the main output log for general messages
    parent: screen,
    tags: true,
    border: 'line',
    bottom: 0,
    left: 0,
    hide: 1,
    show: 0,

    height: '0%',
    width: '0%',
    style: {
        fg: 'white',
        bg: 'black',
        border: {
            fg: '#f0f0f0',
        },
    },
});

// Function to create ASCII progress bar
function createProgressBar(percent, width = 50) {
    const filled = Math.round(width * (percent / 100));
    const empty = width - filled;
    return '[' + '='.repeat(filled) + ' '.repeat(empty) + '] ' + percent + '%';
}

async function getPingLatency(host) {
    return new Promise((resolve) => {
        exec(`ping -n 1 ${host}`, (error, stdout, stderr) => {
            if (error || stderr) {
                resolve('N/A');
                return;
            }
            const match = stdout.match(/Mittelwert = (\d+)ms/);
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
        cpuGauge.setPercent(Math.round(cpuLoad.currentLoad));
        gpuGauge.setPercent(Math.round(cpuLoad.currentLoadGpu));
        // Memory Usage
        const memPercent = Math.round((mem.used / mem.total) * 100);
        memGauge.setPercent(memPercent);

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
            ].join('\n')
        );
        // System Information Log (update less frequently)
        if (!this.lastInfoUpdate || Date.now() - this.lastInfoUpdate > 5000) {
            const [cpu, os] = await Promise.all([si.cpu(), si.osInfo()]);
            sysInfoLog.setContent(
                [
                    // `CPU: ${cpu.manufacturer} ${cpu.brand}`,
                    // `OS: ${os.distro} ${os.release}`,
                    `Memory Total: ${Math.round(mem.total / 1024 / 1024 / 1024)} GB`,
                    `Memory Free: ${Math.round(mem.free / 1024 / 1024 / 1024)} GB`,
                ].join('\n')
            );

            this.lastInfoUpdate = Date.now();
        }

        screen.render();
        updateInProgress = false;
    } catch (error) {
        sysInfoLog.log(themeText.error(`Error: ${error.message}`));
        updateInProgress = false;
    }
}

// Create a container for prompt and input
const inputContainer = blessed.box({
    parent: screen,
    bottom: 6,
    left: 0,
    height: 3,
    border: 'line',
    width: '100%',
    style: {
        fg: theme.colors.fg,
        bg: theme.colors.bg,
    },
});

// Create prompt box for current directory
const promptBox = blessed.box({
    parent: inputContainer,
    bottom: 0,
    left: 0,
    height: 1,
    width: 'shrink',
    style: {
        fg: theme.colors.prompt,
        bg: theme.colors.bg,
    },
});

// Create command input box
const commandInput = blessed.textbox({
    parent: inputContainer,
    bottom: 0,
    height: 1,
    width: '100%-2',
    keys: true,
    mouse: true,
    inputOnFocus: true,
    style: theme.styles.input,
});

// Function to update current directory display
async function updatePrompt() {
    exec('powershell -Command "(Get-Location).Path"', (error, stdout) => {
        if (!error) {
            const path = stdout.trim();
            promptBox.setContent(`PS ${path}> `);
            screen.render();
        }
    });
}

// Function to get file and folder completions
function getFileAndFolderCompletions(input) {
    try {
        const dir = path.dirname(input);
        const base = path.basename(input);
        const fullDir = dir === '.' ? process.cwd() : path.resolve(process.cwd(), dir);

        return fs
            .readdirSync(fullDir)
            .filter((item) => item.toLowerCase().startsWith(base.toLowerCase()))
            .map((item) => {
                const fullPath = path.join(dir, item);
                return fs.statSync(path.resolve(process.cwd(), fullPath)).isDirectory()
                    ? fullPath + '\\'
                    : fullPath;
            });
    } catch (error) {
        return [];
    }
}

// Function to get npm script completions
function getNpmScriptCompletions(input) {
    try {
        // Show all scripts when user types exactly "npm run"
        if (input === 'npm run' || input.startsWith('npm run ')) {
            const packagePath = path.join(process.cwd(), 'package.json');
            if (fs.existsSync(packagePath)) {
                const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                const scripts = packageJson.scripts || {};

                // If there's no space after "npm run", add one
                if (input === 'npm run') {
                    return Object.keys(scripts).map((script) => `npm run ${script}`);
                }

                // If there's text after "npm run ", filter based on that
                const scriptPrefix = input.slice('npm run '.length);
                return Object.keys(scripts)
                    .filter((script) => script.toLowerCase().startsWith(scriptPrefix.toLowerCase()))
                    .map((script) => `npm run ${script}`);
            }
        }
        return [];
    } catch (error) {
        return [];
    }
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

// Handle tab completion
commandInput.key(['tab'], () => {
    const text = commandInput.getValue().trim();

    // Reset completion state if input changed
    if (text !== completionState.lastInput) {
        completionState.current = text;
        completionState.index = -1;

        // Get completions from different sources
        const fileCompletions = getFileAndFolderCompletions(text);
        const npmCompletions = getNpmScriptCompletions(text);
        const profileCmdCompletions = profileCommands.filter((cmd) =>
            cmd.toLowerCase().startsWith(text.toLowerCase())
        );
        const cmdCompletions = commonCommands.filter((cmd) =>
            cmd.toLowerCase().startsWith(text.toLowerCase())
        );

        // Combine all completions
        completionState.results = [
            ...npmCompletions, // Prioritize npm completions
            ...profileCmdCompletions, // Then profile commands
            ...fileCompletions, // Then files and folders
            ...cmdCompletions, // Then common commands
        ];

        completionState.lastInput = text;

        // Show available completions if there are any
        if (completionState.results.length > 0) {
            const maxDisplay = 10; // Show up to 10 completions
            const displayedCompletions = completionState.results.slice(0, maxDisplay);
            const remainingCount = Math.max(0, completionState.results.length - maxDisplay);

            const hint = `
Available completions (${completionState.results.length}):
${displayedCompletions.map((comp, i) => `${i + 1}. ${comp}`).join('\n')}${
    remainingCount > 0
        ? `
...and ${remainingCount} more`
        : ''
}`;

            // Show completions in command log only
            commandLog.show();
            commandLog.log(themeText.completion(hint));
            screen.render();
        }
    }

    // Cycle through results
    if (completionState.results.length > 0) {
        completionState.index = (completionState.index + 1) % completionState.results.length;
        const suggestion = completionState.results[completionState.index];
        commandInput.setValue(suggestion);
        screen.render();
    }
});

// Handle input changes
commandInput.on('keypress', (ch, key) => {
    // Only reset completions on actual input changes, not on tab
    if (key.name !== 'tab') {
        // Reset completion state when input changes
        completionState.lastInput = '';
        completionState.results = [];
        // Clear the completion area
        screen.render();
    }
});

// Handle command execution
commandInput.on('submit', async () => {
    const command = commandInput.getValue();
    if (!command) return;

    try {
        // Add command to output log with themed text
        const promptText = themeText.prompt(`PS ${process.cwd()}>`);
        const cmdText = themeText.input(command);
        commandLog.show(); // Show command output area
        commandLog.log(`
${promptText} ${cmdText}`);

        // Execute command using systeminformation if it's a special command
        if (command.toLowerCase() === 'clear') {
            commandLog.setContent('');
            commandLog.hide();
        } else {
            // Execute PowerShell command
            exec(`powershell -Command "${command}"`, async (error, stdout, stderr) => {
                if (error) {
                    commandLog.log(themeText.error(`Error: ${error.message}`));
                } else if (stderr) {
                    commandLog.log(themeText.warning(stderr));
                } else if (stdout) {
                    commandLog.log(stdout);
                }

                // Add a blank line for better readability
                commandLog.log('');

                // Set a timer to hide the command output after 1 second
                setTimeout(() => {
                    commandLog.hide();
                    screen.render();
                }, 1000);

                // Update prompt after command execution
                await updatePrompt();
            });
        }
    } catch (error) {
        outputLog.log(themeText.error(`Error: ${error.message}`));
    }

    // Clear input after execution
    commandInput.clearValue();
    commandInput.focus();
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
screen.key(['tab'], () => {
    if (!commandInput.focused) {
        commandInput.focus();
    }
});

// Add Ctrl+C handling to both screen and commandInput
screen.key(['C-c'], cleanup);
commandInput.key(['C-c'], cleanup);

// Initial focus
commandInput.focus();

// Initial update
updateSystemInfo();

// Update every second
global.updateInterval = setInterval(updateSystemInfo, 1000);

// Load PowerShell profile commands
(async () => {
    try {
        profileCommands = await getProfileCommands();
        sysInfoLog.log(
            themeText.success(`Loaded ${profileCommands.length} commands from PowerShell profile`)
        );
    } catch (error) {
        sysInfoLog.log(
            themeText.error(`Failed to load PowerShell profile commands: ${error.message}`)
        );
    }
})();

// Initial prompt update
updatePrompt();

// Render the screen
screen.render();

// Keep the process alive
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.stdin.resume();
