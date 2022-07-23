const tailwindcss = require("prettier-plugin-tailwindcss");

/** @type {import("prettier").Config} */
module.exports = {
  plugins: [tailwindcss],
  arrowParens: "always",
  printWidth: 100,
  quoteProps: "consistent",
  trailingComma: "es5",
  proseWrap: "always",
};
