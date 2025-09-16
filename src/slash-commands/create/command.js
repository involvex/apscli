/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const fs = require('fs').promises;
const { executeCommand } = require('../utils.js');

module.exports = {
    name: 'create',
    description: 'Creates various project files.',
    execute: async (args, outputLog, themeText) => {
        const createCommand = args[0];
        switch (createCommand) {
        case 'license':
            outputLog.log(themeText.warning('Creating license...'));
            await executeCommand('npx create-license -o LICENSE', outputLog, themeText);
            outputLog.log(
                themeText.success(
                    'Successfully created LICENSE and configured ESLint for license headers.'
                )
            );
            break;
        case 'eslint':
            outputLog.log(themeText.warning('Setting up ESLint...'));
            await executeCommand('npm init @eslint/config', outputLog, themeText);
            break;
        case 'prettier':
            outputLog.log(themeText.warning('Setting up Prettier...'));
            try {
                const prettierrc = `module.exports = {
    semi: true,
    trailingComma: 'all',
    singleQuote: true,
    printWidth: 120,
    tabWidth: 4,
}`;
                const prettierignore = 'node_modules\ndist\n';
                await fs.writeFile('.prettierrc.cjs', prettierrc);
                await fs.writeFile('.prettierignore', prettierignore);
                outputLog.log(
                    themeText.success(
                        'Successfully created .prettierrc.cjs and .prettierignore'
                    )
                );
            } catch (error) {
                outputLog.log(themeText.error(`Error setting up Prettier: ${error.message}`));
            }
            break;
        case 'tsconfig':
            outputLog.log(themeText.warning('Creating tsconfig.json...'));
            try {
                const tsconfig = `{ 
    "compilerOptions": {
        "target": "es2020",
        "module": "commonjs",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true
    }
}`;
                await fs.writeFile('tsconfig.json', tsconfig);
                outputLog.log(themeText.success('Successfully created tsconfig.json'));
            } catch (error) {
                outputLog.log(
                    themeText.error(`Error creating tsconfig.json: ${error.message}`)
                );
            }
            break;
        case 'test':
            outputLog.log(themeText.warning('Setting up vitest...'));
            try {
                await executeCommand('npm install -D vitest', outputLog, themeText);
                const vitestConfig = `import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // ...
    },
});`;
                await fs.writeFile('vitest.config.js', vitestConfig);
                outputLog.log(themeText.success('Successfully set up vitest'));
            } catch (error) {
                outputLog.log(themeText.error(`Error setting up vitest: ${error.message}`));
            }
            break;
        case 'electron':
            outputLog.log(themeText.warning('Electron setup not yet implemented.'));
            break;
        case 'miui':
            outputLog.log(themeText.warning('Creating miui files...'));
            try {
                const miuiCss = '/* Material UI styles */';
                const indexHtml = `<!DOCTYPE html> 
<html>
<head>
    <title>MIUI</title>
    <link rel="stylesheet" href="miui.css">
</head>
<body>
    <h1>Hello MIUI!</h1>
</body>
</html>
`;
                await fs.writeFile('miui.css', miuiCss);
                await fs.writeFile('index.html', indexHtml);
                outputLog.log(
                    themeText.success('Successfully created miui.css and index.html')
                );
            } catch (error) {
                outputLog.log(themeText.error(`Error creating MIUI files: ${error.message}`));
            }
            break;
        default:
            outputLog.log(
                themeText.warning(
                    'Usage: /create <license|eslint|prettier|tsconfig|test|electron|miui>'
                )
            );
            break;
        }
    },
};
