/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const fs = require('fs').promises;

module.exports = {
    name: 'instruct',
    description: 'Creates a gemini.md file with instructions.',
    execute: async (args, outputLog, themeText) => {
        outputLog.log(themeText.warning('Creating gemini.md...'));
        try {
            let instructContent = '# Gemini CLI Instructions\n\n';
            instructContent += 'This is an interactive CLI. Here are some available commands:\n\n';
            instructContent += '## Slash Commands\n\n';
            instructContent += '*   /init: Initializes a new npm package.\n';
            instructContent += '*   /findpack <package-name>: Searches for an npm package.\n';
            instructContent += '*   /analyze: Analyzes the project and creates a README.md file.\n';
            instructContent += '*   /summary: Creates a docs/Summary.md file.\n';
            instructContent += '*   /instruct: Creates this gemini.md file.\n';

            await fs.writeFile('gemini.md', instructContent);
            outputLog.log(themeText.success('Successfully created gemini.md'));
        } catch (error) {
            outputLog.log(themeText.error(`Error creating gemini.md: ${error.message}`));
        }
    },
};
