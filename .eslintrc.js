module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:vue/recommended",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint",
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "padding-line-between-statements": [
      "warn",
      {
        blankLine: "always",
        prev: [
          "multiline-block-like",
          "multiline-const",
          "multiline-expression",
          "multiline-let",
        ],
        next: "*",
      },
      {
        blankLine: "always",
        prev: "*",
        next: [
          "multiline-block-like",
          "multiline-const",
          "multiline-expression",
          "multiline-let",
        ],
      },
    ],
    "@typescript-eslint/no-unused-vars": ["warn", { args: "none" }],
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      { allowExpressions: true },
    ],
    "lines-between-class-members": [
      "warn",
      "always",
      { exceptAfterSingleLine: true },
    ],
    "@typescript-eslint/no-var-requires": "off",
  },
};
