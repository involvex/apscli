/***********************************************
 * @License
 * Copyright Involvex
 * Copyright 2025
 ***********************************************/

module.exports = {
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'es5',
    printWidth: 100,
    endOfLine: 'auto',
    plugins: [
        'eslint-plugin-prettier',
        'prettier-plugin-packagejson',
        'prettier-plugin-organize-attributes',
        'prettier-plugin-sort-json',
    ],
};
