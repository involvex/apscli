# APS CLI - Advanced PowerShell Command Line Interface

## Description

APS CLI is a powerful and interactive terminal-based command-line interface designed to enhance your PowerShell experience. Built with Node.js, it provides real-time system monitoring, advanced command execution capabilities, and intelligent tab completion, all within a visually appealing and customizable terminal UI.

## Features

- **Interactive Terminal UI:** A rich and responsive user interface powered by `blessed` with improved layout and alignment for system info, command input, and command logs.
- **Real-time System Monitoring:**
    - **CPU Usage:** Monitor your CPU load with a dynamic gauge.
    - **Memory Usage:** Keep track of your system's memory consumption.
    - **GPU Usage:** Observe your GPU utilization.
    - **Disk Usage:** View disk space usage with a clear progress bar.
    - **Network Statistics:** Monitor network activity including download/upload speeds and latency to `1.1.1.1`.
- **Advanced Command Execution:** Execute PowerShell commands directly within the CLI.
- **Intelligent Tab Completion:**
    - Auto-completion for common commands.
    - File and folder path completion.
    - npm script completion (reads from `package.json`).
    - PowerShell profile command completion.
- **Customizable Theming:** Adjust the look and feel to your preference.

## Installation

To get started with APS CLI, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/customterminalui.git
    cd customterminalui
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Usage

To run the APS CLI, execute the following command in your terminal:

```bash
node src/index.js
```

Once launched, you can start typing PowerShell commands. Use the `Tab` key for auto-completion suggestions.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
