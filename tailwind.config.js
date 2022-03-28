const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,vue,ts,tsx}"],
  theme: {
    fontSize: {
      "lg": "1.125rem",
      "xl": "1.25rem",
      "icon-xs": "0.75em",
      "icon-lg": "1.3333333333em",
    },
    extend: {
      colors: {
        accent: "var(--rad-primary-color)",
      },
      spacing: {
        1.25: "0.3125rem",
        3.75: "0.9375rem",
        7.5: "1.875rem",
        7.75: "1.9375rem",
        12.5: "3.125rem",
      },
      animation: {
        spin: "spin 2s linear infinite",
      },
      width: {
        fixed: "1.25em",
      },
    },
  },
  corePlugins: {
    preflight: false,
    container: false,
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("icons", "& .icon");
    }),
  ],
};
