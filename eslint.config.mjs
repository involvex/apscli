/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

import { defineConfig } from 'eslint/config';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

import licenseHeader from 'eslint-plugin-license-header';
import importPlugin from 'eslint-plugin-import';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
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
]);
