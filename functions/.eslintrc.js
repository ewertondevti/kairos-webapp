module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "plugin:promise/recommended",
    "plugin:import/recommended",
  ],
  plugins: ["promise", "import"],
  ignorePatterns: ["lib/**"],
  rules: {
    // Boas práticas
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "off",

    // Importações
    "import/no-unresolved": "off", // Firebase transpila internamente
    "import/newline-after-import": "warn",

    // Promises
    "promise/no-nesting": "warn",
    "promise/no-return-wrap": "warn",
  },
};
