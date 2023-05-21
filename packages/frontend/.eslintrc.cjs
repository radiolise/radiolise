/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

const FAIL_IN_PRODUCTION = process.env.NODE_ENV === "production" ? "error" : "off";

module.exports = {
  root: true,
  extends: [
    "plugin:vue/essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript/recommended",
    "@vue/eslint-config-prettier",
  ],
  rules: {
    "no-console": FAIL_IN_PRODUCTION,
    "no-debugger": FAIL_IN_PRODUCTION,
    "no-undef": "off",
    "prefer-template": "warn",
    "vue/prefer-template": "warn",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { args: "none" }],
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "lines-between-class-members": ["warn", "always", { exceptAfterSingleLine: true }],
    "@typescript-eslint/no-var-requires": "off",
  },
};
