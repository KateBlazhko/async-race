module.exports = {
  env: {
    browser: true,
    es2021: true,
    // node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: 'tsconfig.json'
  },
  plugins: [
    '@typescript-eslint',
    'import'
  ],
  rules: {
    "no-unused-vars": "off",
    "import/extensions": 0,
    "import/no-unresolved": 0,
  },
};
