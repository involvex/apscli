/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const { allCommandCategories } = require('./commands.js');

// Define slash commands
const slashCommands = {
    help: {
        description: 'Show available commands and help information',
        handler: (outputLog, themeText) => {
            if (!outputLog || !themeText) return false;

            outputLog.log(themeText.success('\nAvailable Slash Commands:'));
            outputLog.log(themeText.prompt('  /help') + ' - Show this help message');
            outputLog.log(themeText.prompt('  /clear') + ' - Clear the terminal output');
            outputLog.log(themeText.prompt('  /quit') + ' - Exit the application\n');

            outputLog.log(themeText.success('PowerShell Commands:'));
            allCommandCategories.powerShellCommands.forEach((cmd) => {
                outputLog.log(themeText.prompt(`  ${cmd}`));
            });

            outputLog.log(themeText.success('\nNPM Commands:'));
            allCommandCategories.npmCommands.forEach((cmd) => {
                outputLog.log(themeText.prompt(`  ${cmd}`));
            });

            outputLog.log(themeText.success('\nUnix-like Commands:'));
            allCommandCategories.unixCommands.forEach((cmd) => {
                outputLog.log(themeText.prompt(`  ${cmd}`));
            });

            outputLog.log(themeText.success('\nDevelopment Commands:'));
            allCommandCategories.devCommands.forEach((cmd) => {
                outputLog.log(themeText.prompt(`  ${cmd}`));
            });

            outputLog.log(themeText.success('\nKeyboard Shortcuts:'));
            outputLog.log(themeText.prompt('  Tab') + ' - Command auto-completion');
            outputLog.log(themeText.prompt('  Ctrl+C or q') + ' - Quit the application');
            outputLog.log(themeText.prompt('  Esc') + ' - Clear current input\n');

            return true;
        },
    },
    clear: {
        description: 'Clear the terminal output',
        handler: (outputLog) => {
            if (!outputLog) return false;
            outputLog.setContent('');
            return true;
        },
    },
    quit: {
        description: 'Exit the application',
        handler: () => {
            process.exit(0);
        },
    },
};

/**
 * Handle slash commands
 * @param {string} command - The full command string including the slash
 * @param {object} outputLog - The blessed log widget for output
 * @param {object} themeText - Theme text formatting functions
 * @param {object} commands - Optional additional commands to handle
 * @returns {boolean} - Whether the command was handled
 */
async function handleSlashCommand(command, outputLog, themeText, additionalCommands = {}) {
    try {
        const [cmd, ...args] = command.slice(1).split(' ');
        const commands = { ...slashCommands, ...additionalCommands };

        if (commands[cmd]) {
            return commands[cmd].handler(outputLog, themeText, args);
        }

        return false;
    } catch (error) {
        if (outputLog && themeText) {
            outputLog.log(themeText.error(`Error handling slash command: ${error.message}`));
        }
        return false;
    }
}

/**
 * Load slash commands from a configuration
 * @returns {object} The loaded slash commands
 */
function loadSlashCommands() {
    return slashCommands;
}

module.exports = {
    handleSlashCommand,
    loadSlashCommands,
};
