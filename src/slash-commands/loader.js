/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const fs = require('fs');
const path = require('path');

/**
 * Loads all slash commands from the subdirectories of the slash-commands folder.
 * @returns {Map<string, object>} A map of command names to command modules.
 */
function loadSlashCommands() {
    const commands = new Map();
    const commandFolders = fs.readdirSync(__dirname, { withFileTypes: true });

    for (const folder of commandFolders) {
        if (folder.isDirectory()) {
            const commandPath = path.join(__dirname, folder.name, 'command.js');
            try {
                const command = require(commandPath);
                if (command.name && command.execute) {
                    commands.set(command.name, command);
                }
            } catch (error) {
                // console.error(`Error loading command ${folder.name}:`, error);
            }
        }
    }

    return commands;
}

module.exports = { loadSlashCommands };
