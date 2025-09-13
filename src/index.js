/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const blessed = require('blessed');
// const contrib = require('blessed-contrib'); // No longer used
const si = require('systeminformation');
const chalk = require('chalk');
const figlet = require('figlet');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Import custom modules
const { allCommands } = require('./commands.js');
const theme = require('./theme.js');
const { getProfileCommands, getGpuUsage } = require('./powershell-utils.js');
// Initialize theme text functions
const { text: themeText } = theme;

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
    height: 5, // Increased header height to fit figlet text
    title: 'APS CLI', // Shortened title
    setContent: 'APSCLI',
    align: 'center',
    valign: 'middle',
    tags: true,
    style: theme.styles.box,
    border: 'line',
    text: 'APSCLI',
});

figlet.text(
    'APSCLI',
    {
        fontsize: 1,
        font: 'Mini',
        horizontalLayout: 'default',
        verticalLayout: 'default',
    },
    (err, data) => {
        if (!err) {
            header.setContent(data);
        }
        screen.render();
    }
);

// Gauges container
const gaugesContainer = blessed.box({
    parent: screen,
    top: 5,
    left: 'center',
    width: '99%',
    height: 3, // Fixed height for gauges
});

// CPU Usage gauge
const cpuGauge = blessed.progressbar({
    parent: gaugesContainer,
    label: 'CPU Usage',
    top: 0,
    left: 0,
    width: '33%',
    height: '100%', // Fill parent height
    style: { ...theme.styles.box, bar: { bg: theme.colors.fg } },
    border: 'line',
    filled: 0,
});

// Memory gauge
const memGauge = blessed.progressbar({
    parent: gaugesContainer,
    label: 'Memory Usage',
    top: 0,
    left: '33%',
    width: '33%',
    height: '100%', // Fill parent height
    style: { ...theme.styles.box, bar: { bg: theme.colors.fg } },
    border: 'line',
    filled: 0,
});

const gpuGauge = blessed.progressbar({
    parent: gaugesContainer,
    label: 'GPU Usage',
    top: 0,
    left: '66%',
    width: '34%',
    height: '100%', // Fill parent height
    style: { ...theme.styles.box, bar: { bg: theme.colors.fg } },
    border: 'line',
});

// Info row container (for Disk, Network, System Info)
const infoRowContainer = blessed.box({
    parent: screen,
    top: 8, // Below gaugesContainer (5 + 3)
    left: 'center',
    width: '99%',
    height: 5, // Fixed height for this row
});

// Disk usage box
const diskBox = blessed.box({
    parent: infoRowContainer,
    label: 'Disk Usage',
    top: 0,
    left: 0,
    width: '33%',
    height: '100%', // Fill parent height
    style: theme.styles.box,
    border: 'line',
});

// Network stats
const networkStats = blessed.log({
    parent: infoRowContainer,
    label: 'Network Stats',
    top: 0,
    left: '33%',
    width: '33%',
    height: '100%', // Fill parent height
    style: theme.styles.log,
    border: 'line',
});

// System info log
const sysInfoLog = blessed.log({
    parent: infoRowContainer,
    label: 'System Info',
    top: 0,
    left: '66%',
    width: '34%',
    height: '100%', // Fill parent height
    style: theme.styles.log,
    border: 'line',
});

// Command output log (main terminal output)
const outputLog = blessed.log({
    parent: screen,
    tags: true,
    border: 'line',
    top: 13, // Below infoRowContainer (5 + 3 + 5)
    height: '40%', // Adjusted height for better fit
    bottom: 'auto',
    left: 0,
    width: '100%',
    label: 'Terminal Output',
    style: { ...theme.styles.log, bg: theme.colors.bg }, // Explicitly set background
    scrollable: true,
    alwaysScroll: true,
    scrollbar: {
        style: {
            bg: theme.colors.scrollbar,
        },
    },
    mouse: true,
    hidden: false,
});

// Executed Command Log (history of commands)
const executedCommandLog = blessed.log({
    parent: screen,
    bottom: 3, // Above inputContainer
    height: '20%', // Adjusted height
    left: 0,
    width: '100%',
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
    hidden: false,
});

// Function to create ASCII progress bar
function createProgressBar(percent, width = 20) {
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
let gpuErrorLogged = false; // Flag to log GPU error only once
async function updateSystemInfo() {
    if (updateInProgress) return;
    updateInProgress = true;

    try {
        // Update in parallel for better performance
        const [cpuLoad, mem, disk, netStats, gpuUsage] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.fsSize(),
            si.networkStats(),
            getGpuUsage(),
        ]);

        // CPU Usage
        const cpuPercent = Math.round(cpuLoad.currentLoad || 0);
        cpuGauge.setProgress(cpuPercent);

        // GPU Usage
        if (typeof gpuUsage === 'number' && gpuUsage >= 0) {
            gpuGauge.setProgress(Math.round(gpuUsage));
        } else if (gpuUsage && gpuUsage.error && !gpuErrorLogged) {
            executedCommandLog.log(themeText.error(`GPU Error: ${gpuUsage.error}`));
            gpuErrorLogged = true; // Set flag to true after logging
        } else if (cpuLoad.currentLoadGpu) {
            // fallback
            gpuGauge.setProgress(Math.round(cpuLoad.currentLoadGpu));
        } else {
            gpuGauge.setProgress(0); // No GPU usage data
            if (!gpuErrorLogged) {
                executedCommandLog.log(themeText.warning('No GPU usage data available'));
                gpuErrorLogged = true;
            }
        }

        // Memory Usage
        const memPercent = Math.round((mem.used / mem.total) * 100);
        memGauge.setProgress(memPercent);

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
                    ' Latency: ' +
                    (await getPingLatency('1.1.1.1')) +
                    ' ms',
            ].join('\n')
        );
        // System Information Log (update less frequently)
        if (!lastInfoUpdate || Date.now() - lastInfoUpdate > 5000) {
            const [cpu, os] = await Promise.all([si.cpu(), si.osInfo()]);
            sysInfoLog.setContent(
                [
                    //     `CPU: ${cpu.manufacturer} ${cpu.brand}`,
                    //     `OS: ${os.distro} ${os.release}`,
                    `Memory Total: ${Math.round(mem.total / 1024 / 1024 / 1024)} GB`,
                    `Memory Free: ${Math.round(mem.free / 1024 / 1024 / 1024)} GB`,
                ].join('\n')
            );

            lastInfoUpdate = Date.now();
        }

        screen.render();
        updateInProgress = false;
    } catch (error) {
        executedCommandLog.log(themeText.error(`Error: ${error.message}`));
        updateInProgress = false;
    }
}

// Completion box
const completionBox = blessed.box({
    parent: screen,
    bottom: 6, // Above executedCommandLog (3 + 3)
    height: '20%', // Adjusted height
    width: '100%',
    border: 'line',
    style: theme.styles.box,
    hidden: true,
});

// Create a container for prompt and input
const inputContainer = blessed.box({
    parent: screen,
    bottom: 0,
    left: 0,
    height: 3, // Fixed height for input container
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
    top: 1,
    left: 0,
    height: 1,
    width: '50%', // Fixed width for prompt
    style: {
        fg: theme.colors.prompt,
        bg: theme.colors.bg,
    },
});

// Create command input box
const commandInput = blessed.textbox({
    parent: inputContainer,
    top: 1,
    left: '50%', // Position after prompt
    height: 1,
    width: '50%', // Adjust width to fill remaining space
    keys: true,
    mouse: true,
    inputOnFocus: true,
    style: theme.styles.input,
});

// Function to update current directory display
async function updatePrompt() {
    const path = process.cwd();
    promptBox.setContent(`PS ${path}> `);
    screen.render();
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
                    ? fullPath + '\\' // Corrected escaping for backslash in directory path
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
    const currentInputValue = commandInput.getValue().trim();
    let isNewCompletionCycle = false;

    // If input has changed, re-evaluate completions and reset index
    if (currentInputValue !== completionState.lastInput) {
        completionState.current = currentInputValue;
        completionState.index = -1; // Reset index for new input
        isNewCompletionCycle = true;

        const fileCompletions = getFileAndFolderCompletions(currentInputValue);
        const npmCompletions = getNpmScriptCompletions(currentInputValue);
        const profileCmdCompletions = profileCommands.filter((cmd) =>
            cmd.toLowerCase().startsWith(currentInputValue.toLowerCase())
        );
        const cmdCompletions = commonCommands.filter((cmd) =>
            cmd.toLowerCase().startsWith(currentInputValue.toLowerCase())
        );

        completionState.results = [
            ...npmCompletions,
            ...profileCmdCompletions,
            ...fileCompletions,
            ...cmdCompletions,
        ];

        completionState.lastInput = currentInputValue; // Update lastInput after generating results
    }

    // Cycle through results if available
    if (completionState.results.length > 0) {
        // Increment index for cycling
        completionState.index = (completionState.index + 1) % completionState.results.length;
        const suggestion = completionState.results[completionState.index];

        // On the very first tab press for a new input, just show the first suggestion in the box.
        // Do NOT update commandInput.setValue() yet.
        // On subsequent tab presses, cycle and update the input field.
        if (!isNewCompletionCycle && currentInputValue !== '') {
            commandInput.setValue(suggestion);
        }

        // Always update the completion box to show the current suggestion
        const maxDisplay = 10;
        const displayedCompletions = completionState.results.slice(0, maxDisplay);
        const remainingCount = Math.max(0, completionState.results.length - maxDisplay);

        const hint = `Available completions (${
            completionState.results.length
        }):\n${displayedCompletions.join('\n')}${
            remainingCount > 0 ? `\n...and ${remainingCount} more` : ''
        }`;

        completionBox.setContent(hint);
        completionBox.show();
        screen.render();
    } else {
        // No completions, hide the box
        completionBox.hide();
        screen.render();
    }
});

// Handle space to select completion
commandInput.key(['space'], () => {
    if (completionState.results.length > 0) {
        // A completion is active. We accept it.
        // The value is already in the input.
        // We just need to reset the completion state.
        completionState.lastInput = '';
        completionState.results = [];
        completionBox.hide();
        screen.render();
        // The blessed textbox will automatically add the space character.
        // We just need to ensure the completion state is reset.
    }
    // If no completion is active, let the default behavior of 'space' occur.
    // No explicit action needed here.
});

// Handle input changes
commandInput.on('keypress', (ch, key) => {
    // Only reset completions on actual input changes, not on tab or space (if completion is active)
    if (key.name !== 'tab' && !(key.name === 'space' && completionState.results.length > 0)) {
        // Reset completion state when input changes
        completionState.lastInput = '';
        completionState.results = [];
        completionBox.hide();
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
        outputLog.log(`
        ${promptText} ${cmdText}`);

        const [cmd, ...args] = command.trim().split(' ');

        // Execute command using systeminformation if it's a special command
        if (cmd.toLowerCase() === 'clear') {
            outputLog.setContent('');
            executedCommandLog.setContent('');
        } else if (cmd.toLowerCase() === 'cd') {
            try {
                const newDir = args[0] || process.env.HOME;
                process.chdir(newDir);
                await updatePrompt();
            } catch (err) {
                executedCommandLog.log(themeText.error(`cd: ${err.message}`));
            }
        } else {
            // Execute PowerShell command
            exec(`powershell -Command "${command}"`, async (error, stdout, stderr) => {
                if (error) {
                    executedCommandLog.log(themeText.error(`Error: ${error.message}`));
                } else if (stderr) {
                    executedCommandLog.log(themeText.warning(stderr));
                } else if (stdout) {
                    outputLog.log(stdout);
                }
                await updatePrompt();
            });
        }
    } catch (error) {
        executedCommandLog.log(themeText.error(`Error: ${error.message}`));
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

// Initial prompt update
updatePrompt();

// Render the screen to start the UI
screen.render();

// Once the screen has rendered for the first time, start background processes
screen.once('render', () => {
    // Load PowerShell profile commands
    (async () => {
        try {
            profileCommands = await getProfileCommands();
            // Log to outputLog instead of sysInfoLog
            outputLog.log(
                themeText.success(
                    `Loaded ${profileCommands.length} commands from PowerShell profile`
                )
            );
        } catch (error) {
            executedCommandLog.log(
                themeText.error(`Failed to load PowerShell profile commands: ${error.message}`)
            );
        }
    })();

    // Initial update
    updateSystemInfo();

    // Force immediate gauge rendering to ensure visibility
    setTimeout(() => {
        try {
            cpuGauge.setProgress(0);
            memGauge.setProgress(0);
            gpuGauge.setProgress(0);
            screen.render();
        } catch (error) {
            // Log but don't fail initialization
            console.error('Error initializing gauges:', error);
        }
    }, 500);

    // Start the update loop
    global.updateInterval = setInterval(updateSystemInfo, 3000);
});

// Keep the process alive
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.stdin.resume();
