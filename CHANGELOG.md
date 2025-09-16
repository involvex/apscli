# Changelog

## [0.1.0] - 2025-09-14

### Added

- New modular slash command system. Commands are now loaded from `src/slash-commands`.
- New themeing system. Themes can be loaded from `.css` files from `src/themes`.
- `CHANGELOG.md` file.

### Changed

- Project structure refactored for better organization.
- Main application logic moved to `src/core`.
- Themes moved to `src/themes`.
- Slash commands moved to `src/slash-commands`.
- Updated all paths and require statements to reflect the new structure.
- Updated `package.json` scripts to point to the new file locations.
- ESLint configuration updated to handle new file structure.

### Fixed

- Removed `--exit` flag from test script to prevent the application from closing after tests.
- Fixed ESLint errors related to mocha globals in test files.
- Removed several unused variables.
