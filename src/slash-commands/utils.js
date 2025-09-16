/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

/**
 * Executes a shell command and logs its output.
 * @param {string} command - The command to execute.
 * @param {object} outputLog - The blessed-log object to log output to.
 * @param {object} themeText - The theme text functions.
 */
async function executeCommand(command, outputLog, themeText) {
    try {
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            outputLog.log(themeText.warning(stderr));
        }
        if (stdout) {
            outputLog.log(themeText.success(stdout));
        }
    } catch (error) {
        outputLog.log(themeText.error(`Error: ${error.message}`));
    }
}

module.exports = { executeCommand };
