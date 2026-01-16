const tsParser = require("@typescript-eslint/parser");
const importPlugin = require("eslint-plugin-import");
const promisePlugin = require("eslint-plugin-promise");

module.exports = [
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["lib/**"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      import: importPlugin,
      promise: promisePlugin,
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "import/no-unresolved": "off",
      "import/newline-after-import": "warn",
      "promise/no-nesting": "warn",
      "promise/no-return-wrap": "warn",
    },
  },
];
