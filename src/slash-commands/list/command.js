/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const { executeCommand } = require('../utils.js');

module.exports = {
    name: 'list',
    description: 'Lists packages and checks for updates.',
    execute: async (args, outputLog, themeText) => {
        outputLog.log(themeText.warning('Listing packages and checking for updates...'));
        await executeCommand('npm list --depth=0', outputLog, themeText);
    },
};
