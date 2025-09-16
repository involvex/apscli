# GEMINI.md

## Project Overview

This project, "APS CLI," is an advanced, interactive terminal-based command-line interface for PowerShell. It's built with Node.js and provides real-time system monitoring, advanced command execution, and intelligent tab completion. The project has two main components: a terminal UI built with the `blessed` library and a web-based UI that provides a similar experience in the browser.

**Key Technologies:**

- **Backend:** Node.js, Express.js, Socket.IO
- **Terminal UI:** `blessed`, `blessed-contrib`
- **Frontend:** TypeScript, xterm.js
- **System Information:** `systeminformation`
- **Build:** `esbuild`, `pkg`

**Architecture:**

- **`src/index.js`:** The main entry point for the terminal application. It initializes the `blessed`-based UI, gathers system information, and handles command execution and tab completion.
- **`server.js`:** An Express.js server that provides a web-based interface for the CLI. It serves the frontend application and provides API endpoints for command execution and autocomplete.
- **`public/apscli/src/index.ts`:** The frontend TypeScript code that sets up the `xterm.js` terminal, communicates with the backend via HTTP and Socket.IO, and handles user input.

## Building and Running

### Terminal Application

- **Run the CLI:**

    ```bash
    npm start
    ```

    or

    ```bash
    node src/index.js
    ```

- **Run in development mode (with nodemon):**

    ```bash
    npm run dev
    ```

- **Build an executable:**

    ```bash
    npm run build
    ```

    This will create an executable file in the `dist` directory.

- **Maintainability**

    After every request ,verify the build is clean working.
    Fix imports, linters, type errors.
    write detailed(with summary what has been done)
    suggest further improvements and feature extensions.!!

### Web Application

- **Run the web server:**
    ```bash
    npm run start:web
    ```
    The web application will be available at `http://localhost:3000`.

### Testing

- **Run tests:**
    ```bash
    npm test
    ```

## Development Conventions

- **Linting:** The project uses ESLint for code linting.
    - **Check for linting errors:**
        ```bash
        npm run lint
        ```
    - **Fix linting errors:**
        ```bash
        npm run lint:fix
        ```

- **Formatting:** The project uses Prettier for code formatting.
    - **Format code:**
        ```bash
        npm run format
        ```
    - **Check for formatting issues:**
        ```bash
        npm run format:check
        ```

- **Contribution:** The `Readme.md` file encourages contributions via pull requests and issues.
