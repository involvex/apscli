/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

import licenseHeader from 'eslint-plugin-license-header';
import * as importPlugin from 'eslint-plugin-import';
import html from 'eslint-plugin-html';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'public/apscli/dist/**',
            'public/apscli/node_modules/**',
        ],
    },
    {
        extends: compat.extends('eslint:recommended'),

        languageOptions: {
            globals: {
                ...globals.node,
            },

            ecmaVersion: 2022,
            sourceType: 'module',
        },
        plugins: {
            'license-header': licenseHeader,
            'eslint-ignore': ['error', globalIgnores],
            // 'ignores': importPlugin.configs.ignores,
            import: importPlugin.configs.recommended,
            html: html,
        },

        rules: {
            indent: ['error', 4],
            'linebreak-style': 'off',
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            'ignores/no-unused-vars': 'off',
            'no-unused-vars': 'warn',
            'no-console': 'off',
            'license-header/header': [
                'error',
                [
                    '/***********************************************',
                    ' * @License',
                    ' * Copyright Involvex',
                    ' * Copyright ' + new Date().getFullYear(),
                    ' ***********************************************/',
                ],
            ],
        },
    },
    {
        files: ['src/core/tests/*.js'],
        languageOptions: {
            globals: {
                ...globals.mocha,
            },
        },
    },
]);
// This is a temporary file for command handling setup.
// It is not used in the main application.
// The main application uses the command handling logic in src/index.js.
