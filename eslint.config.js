const nextConfig = require("eslint-config-next");

module.exports = [
  {
    ignores: ["dist/**", "functions/**"],
  },
  ...nextConfig,
];
