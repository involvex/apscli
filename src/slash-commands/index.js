/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const { loadSlashCommands } = require('./loader.js');

/**
 * Handles slash commands.
 * @param {string} command - The command to handle.
 * @param {object} outputLog - The blessed-log object to log output to.
 * @param {object} themeText - The theme text functions.
 * @param {Map<string, object>} commands - A map of command names to command modules.
 * @returns {boolean} - True if the command was handled, false otherwise.
 */
async function handleSlashCommand(command, outputLog, themeText, commands) {
    const [cmd, ...args] = command.trim().substring(1).split(' ');

    const slashCommand = commands.get(cmd);

    if (slashCommand) {
        try {
            await slashCommand.execute(args, outputLog, themeText);
        } catch (error) {
            outputLog.log(themeText.error(`Error executing command ${cmd}: ${error.message}`));
        }
        return true;
    } else {
        return false; // Command not handled
    }
}

module.exports = {
    loadSlashCommands,
    handleSlashCommand,
};
