/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'analyze',
    description: 'Analyzes the project and creates a README.md file.',
    execute: async (args, outputLog, themeText) => {
        outputLog.log(themeText.warning('Analyzing project...'));
        try {
            const packageJsonPath = path.join(process.cwd(), 'package.json');
            const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

            let readmeContent = `# ${packageJson.name || 'Project'}\n\n`;
            readmeContent += `${packageJson.description || ''}\n\n`;
            readmeContent += '## Installation\n\n' + '```bash\n' + 'npm install\n' + '```' + '\n\n';
            readmeContent += '## Available Scripts\n\n';
            for (const script in packageJson.scripts) {
                readmeContent +=
                    '*   ' +
                    '`' +
                    script +
                    '`' +
                    ': ' +
                    '`' +
                    packageJson.scripts[script] +
                    '`' +
                    '\n';
            }
            readmeContent += '\n';

            readmeContent += '## Dependencies\n\n';
            for (const dep in packageJson.dependencies) {
                readmeContent += `*   ${dep}: ${packageJson.dependencies[dep]}\n`;
            }
            readmeContent += '\n';

            if (packageJson.devDependencies) {
                readmeContent += '## Dev Dependencies\n\n';
                for (const dep in packageJson.devDependencies) {
                    readmeContent += `*   ${dep}: ${packageJson.devDependencies[dep]}\n`;
                }
                readmeContent += '\n';
            }

            await fs.writeFile('README.md', readmeContent);
            outputLog.log(themeText.success('Successfully created README.md'));
        } catch (error) {
            outputLog.log(themeText.error(`Error analyzing project: ${error.message}`));
        }
    },
};
