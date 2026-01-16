const nextConfig = require("eslint-config-next");

module.exports = [
  {
    ignores: [".firebase/**", ".next/**", "dist/**", "functions/**", "out/**"],
  },
  ...nextConfig,
];
