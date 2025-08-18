import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        XMLHttpRequest: 'readonly',
        URLSearchParams: 'readonly',
        CustomEvent: 'readonly',
        Math: 'readonly',
        Number: 'readonly',
        JSON: 'readonly',
        Error: 'readonly',
        Promise: 'readonly',
        Array: 'readonly'
      }
    },
    rules: {
      // Allow console for debugging
      'no-console': 'off',
      
      // Basic quality rules
      'no-debugger': 'error',
      'no-unused-vars': ['error', { 'vars': 'local', 'args': 'after-used' }],
      'no-undef': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': 'error',
      
      // Style rules
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'indent': ['error', 2],
      'no-trailing-spaces': 'error'
    }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        setTimeout: 'readonly',
        URL: 'readonly',
        globalThis: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^(ok|status)$' }]
    }
  }
];
