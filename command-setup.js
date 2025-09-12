/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

// Temporary command handling setup
const commandSetup = {
    init: function (screen, sysLog) {
        // Create input container
        const inputContainer = blessed.box({
            parent: screen,
            bottom: 0,
            left: 0,
            height: 1,
            width: '100%',
            style: {
                fg: '#00ff00',
                bg: '#000000',
            },
        });

        // Create prompt box
        const promptBox = blessed.box({
            parent: inputContainer,
            bottom: 0,
            left: 0,
            height: 1,
            width: 'shrink',
            content: 'PS > ',
            style: {
                fg: '#00ff00',
                bg: '#000000',
            },
        });

        // Create command input
        const commandInput = blessed.textbox({
            parent: inputContainer,
            bottom: 0,
            left: 5,
            height: 1,
            width: '100%-5',
            keys: true,
            mouse: true,
            inputOnFocus: true,
            style: {
                fg: '#00ff00',
                bg: '#000000',
            },
        });

        // Setup completion
        const completionState = {
            current: '',
            index: -1,
            results: [],
            lastInput: '',
        };

        // PowerShell commands for completion
        const commands = [
            'Get-Process',
            'Get-Service',
            'Stop-Process',
            'Start-Process',
            'Get-Content',
            'Set-Content',
            'Get-Item',
            'Set-Item',
            'Get-Location',
            'Set-Location',
            'Clear-Host',
            'Write-Host',
            'Get-ChildItem',
            'Remove-Item',
            'Copy-Item',
            'Move-Item',
            'New-Item',
            'Invoke-Command',
            'Get-Help',
            'Get-Command',
        ];

        // Handle tab completion
        commandInput.key(['tab'], () => {
            const text = commandInput.getValue().trim();

            if (text !== completionState.lastInput) {
                completionState.current = text;
                completionState.index = -1;
                completionState.results = commands.filter((cmd) =>
                    cmd.toLowerCase().startsWith(text.toLowerCase())
                );
                completionState.lastInput = text;
            }

            if (completionState.results.length > 0) {
                completionState.index =
                    (completionState.index + 1) % completionState.results.length;
                commandInput.setValue(completionState.results[completionState.index]);
                screen.render();
            }
        });

        // Handle command execution
        commandInput.on('submit', () => {
            const command = commandInput.getValue().trim();
            if (!command) return;

            // Log the command
            sysLog.log(`PS ${process.cwd()}> ${command}`);

            if (command.toLowerCase() === 'clear') {
                sysLog.setContent('');
            } else {
                // Execute PowerShell command
                const { exec } = require('child_process');
                exec(`powershell -Command "${command}"`, (error, stdout, stderr) => {
                    if (error) {
                        sysLog.log(`Error: ${error.message}`);
                    } else if (stderr) {
                        sysLog.log(`Error: ${stderr}`);
                    } else if (stdout) {
                        sysLog.log(stdout);
                    }

                    // Update prompt and refocus
                    exec('powershell -Command "(Get-Location).Path"', (err, pathOut) => {
                        if (!err) {
                            promptBox.setContent(`PS ${pathOut.trim()}> `);
                            screen.render();
                        }
                        commandInput.clearValue();
                        commandInput.focus();
                        screen.render();
                    });
                });
            }
        });

        // Handle input changes
        commandInput.on('keypress', () => {
            completionState.lastInput = '';
        });

        commandInput.key(['escape'], () => {
            commandInput.clearValue();
            screen.render();
        });

        return { promptBox, commandInput };
    },
};
