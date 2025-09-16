/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'summary',
    description: 'Creates a docs/Summary.md file.',
    execute: async (args, outputLog, themeText) => {
        outputLog.log(themeText.warning('Creating summary...'));
        try {
            const packageJsonPath = path.join(process.cwd(), 'package.json');
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

            const docsDir = path.join(process.cwd(), 'docs');
            try {
                await fs.mkdir(docsDir, { recursive: true });
            } catch {
                // ignore if dir exists
            }

            let summaryContent = `# ${packageJson.name || 'Project'}\n\n`;
            summaryContent += `${packageJson.description || ''}\n`;

            await fs.writeFile(path.join(docsDir, 'Summary.md'), summaryContent);
            outputLog.log(themeText.success('Successfully created docs/Summary.md'));
        } catch (error) {
            outputLog.log(themeText.error(`Error creating summary: ${error.message}`));
        }
    },
};
