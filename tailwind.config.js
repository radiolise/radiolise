const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variableName}))`;
    }
    return `rgb(var(${variableName}) / ${opacityValue})`;
  };
}

module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,jsx,vue,ts,tsx}"],
  darkMode: "class",
  theme: {
    fontSize: {
      "lg": "1.125rem",
      "xl": "1.25rem",
      "icon-xs": "0.75em",
      "icon-lg": "1.3333333333em",
    },
    extend: {
      colors: {
        "brand": "#222222",
        "accent": ({ opacityValue }) => {
          const fallback = withOpacity("--rad-color-primary")({ opacityValue });
          return `var(--rad-color-accent, ${fallback})`;
        },
        "emphasis": withOpacity("--rad-color-emphasis"),
        "on-emphasis": withOpacity("--rad-color-on-emphasis"),
        "strong": withOpacity("--rad-color-strong"),
        "on-strong": withOpacity("--rad-color-on-strong"),
        "default": withOpacity("--rad-color-default"),
        "surface": withOpacity("--rad-color-surface"),
        "on-surface": withOpacity("--rad-color-on-surface"),
        "soft": withOpacity("--rad-color-soft"),
        "mute": {
          DEFAULT: withOpacity("--rad-color-mute"),
          contrast: withOpacity("--rad-color-mute-contrast"),
        },
        "bird": {
          accent: withOpacity("--rad-color-bird-accent"),
        },
      },
      spacing: {
        borders: "var(--rad-border-width, 0)",
        scrollbar: "var(--rad-scrollbar-width)",
        1.25: "0.3125rem",
        3.75: "0.9375rem",
        7.5: "1.875rem",
        7.75: "1.9375rem",
        12.5: "3.125rem",
      },
      animation: {
        spin: "spin 2s linear infinite",
      },
      backdropBlur: {
        DEFAULT: "var(--rad-backdrop-blur, 0)",
      },
      borderColor: ({ theme }) => ({
        DEFAULT: theme("colors.accent"),
      }),
      borderRadius: {
        DEFAULT: "var(--rad-border-radius, 0)",
      },
      boxShadow: {
        theme: "var(--rad-shadow)",
      },
      fontFamily: {
        sans: ['"Fira Sans"', ...defaultTheme.fontFamily.sans],
      },
      height: {
        tags: "var(--rad-station-tags-height)",
      },
      maxWidth: {
        sidebar: "29.375rem",
      },
      padding: {
        "station": "var(--rad-station-padding-base)",
        "station-sm": "var(--rad-station-padding-small)",
        "station-inner": "var(--rad-station-padding-inner)",
      },
      transitionDuration: {
        DEFAULT: "300ms",
      },
      width: {
        "fixed": "1.25em",
        "page-left": "calc(50% - 460px)",
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
