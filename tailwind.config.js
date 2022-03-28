const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,vue,ts,tsx}"],
  theme: {
    fontSize: {
      "icon-xs": "0.75em",
      "icon-lg": "1.3333333333em",
    },
    extend: {
      spacing: {
        1.25: "0.3125rem",
        7.75: "1.9375rem",
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
