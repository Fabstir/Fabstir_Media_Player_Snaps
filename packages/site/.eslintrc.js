module.exports = {
  extends: [
    'next',
    'next/core-web-vitals',
    '../../.eslintrc.js',
    // 'plugin:prettier/recommended', // Removed this line
  ],

  rules: {
    'react/display-name': 'off',
    'react/no-direct-mutation-state': 'off',
    'react/require-render-return': 'off',
    'prettier/prettier': ['error', { endOfLine: 'auto' }], // Add this rule
    '@typescript-eslint/no-parameter-properties': 'off',
    'no-process-env': 'off',
    // curly: ['error', 'multi-or-nest'],
    curly: ['off'],
    'import/no-named-as-default-member': 'off', // Disabling the rule that warns about named imports from a default-exported module
    'node/no-process-env': 'off',
  },

  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module', // Ensures that ESLint understands module syntax
    ecmaVersion: 2020, // Updating ECMAScript version for compatibility with latest syntax
  },

  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      rules: {
        'jsdoc/require-jsdoc': 0,
      },
    },
  ],

  ignorePatterns: ['!.eslintrc.js', 'build/'],
};
