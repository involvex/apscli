/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const si = require('systeminformation');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { allCommands } = require('./src/commands.js');
const { getProfileCommands, getGpuUsage } = require('./src/powershell-utils.js');

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON body parsing
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

app.use(express.static(path.join(__dirname, 'public', 'apscli', 'dist')));

// --- Autocomplete Logic ---
function getFileAndFolderCompletions(input) {
    try {
        const dir = path.dirname(input);
        const base = path.basename(input);
        const fullDir = dir === '.' ? process.cwd() : path.resolve(process.cwd(), dir);

        return fs
            .readdirSync(fullDir)
            .filter((item) => item.toLowerCase().startsWith(base.toLowerCase()))
            .map((item) => {
                const fullPath = path.join(dir, item);
                try {
                    return fs.statSync(path.resolve(process.cwd(), fullPath)).isDirectory()
                        ? fullPath + '\\' // Corrected escaping for backslash
                        : fullPath;
                } catch (e) {
                    return fullPath;
                }
            });
    } catch (error) {
        return [];
    }
}

function getNpmScriptCompletions(input) {
    try {
        if (input.startsWith('npm run ')) {
            const packagePath = path.join(process.cwd(), 'package.json');
            if (fs.existsSync(packagePath)) {
                const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                const scripts = packageJson.scripts || {};
                const scriptPrefix = input.slice('npm run '.length);
                return Object.keys(scripts)
                    .filter((script) => script.toLowerCase().startsWith(scriptPrefix.toLowerCase()))
                    .map((script) => `npm run ${script}`);
            }
        }
        return [];
    } catch (error) {
        return [];
    }
}

app.get('/autocomplete', async (req, res) => {
    const text = req.query.text || '';
    const fileCompletions = getFileAndFolderCompletions(text);
    const npmCompletions = getNpmScriptCompletions(text);
    const profileCommands = await getProfileCommands();
    const profileCmdCompletions = profileCommands.filter((cmd) =>
        cmd.toLowerCase().startsWith(text.toLowerCase())
    );
    const cmdCompletions = allCommands.filter((cmd) =>
        cmd.toLowerCase().startsWith(text.toLowerCase())
    );

    console.log('Profile Commands:', profileCommands); // Log profile commands for debugging

    const results = [
        ...npmCompletions,
        ...profileCmdCompletions,
        ...fileCompletions,
        ...cmdCompletions,
    ];

    res.json([...new Set(results)]); // Remove duplicates
});

// --- Command Execution Endpoint ---
app.post('/execute-command', async (req, res) => {
    // Made async to await getProfileCommands
    const { command } = req.body;
    if (!command) {
        return res.status(400).json({ error: 'Command is required' });
    }

    const profileCommands = await getProfileCommands();
    const allKnownCommands = [...allCommands, ...profileCommands];
    const commandName = command.split(' ')[0].toLowerCase();

    let shellCommand;
    // Check if the command is a known PowerShell command or alias/function from profile
    if (allKnownCommands.some((cmd) => cmd.toLowerCase().startsWith(commandName))) {
        // Execute in PowerShell context
        shellCommand = `powershell -Command "& { ${command}"}`;
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
