/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const { executeCommand } = require('../utils.js');

module.exports = {
    name: 'findpack',
    description: 'Searches for an npm package.',
    execute: async (args, outputLog, themeText) => {
        if (args.length > 0) {
            await executeCommand(`npm search ${args.join(' ')}`, outputLog, themeText);
        } else {
            outputLog.log(themeText.warning('Usage: /findpack <package-name>'));
        }
    },
};
