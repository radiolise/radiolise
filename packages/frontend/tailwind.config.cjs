const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

function withFallbackColor(variableName, fallbackVariableName) {
  return `var(${variableName}, rgb(var(${fallbackVariableName})))`;
}

function withOpacity(variableName) {
  return `rgb(var(${variableName}) / <alpha-value>)`;
}

/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,vue,ts,tsx}"],
  darkMode: "class",
  theme: {
    screens: {
      xs: "480px",
      sm: "600px",
      md: "680px",
      mobile: { max: "820px" },
      lg: "1024px",
      xl: "1230px",
    },
    fontSize: {
      "xs": "0.75rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "icon-xs": "0.75em",
      "icon-lg": "1.3333333333em",
    },
    extend: {
      colors: {
        "brand": "#222222",
        "accent": withFallbackColor("--rad-color-accent", "--rad-color-primary"),
        "default": withFallbackColor("--rad-color-background", "--rad-color-default"),
        "emphasis": withOpacity("--rad-color-emphasis"),
        "on-emphasis": withOpacity("--rad-color-on-emphasis"),
        "strong": withOpacity("--rad-color-strong"),
        "on-strong": withOpacity("--rad-color-on-strong"),
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
        0.75: "0.1875rem",
        1.25: "0.3125rem",
        3.75: "0.9375rem",
        6.25: "1.5625rem",
        6.5: "1.625rem",
        7.5: "1.875rem",
        7.75: "1.9375rem",
        8.75: "2.1875rem",
        12.5: "3.125rem",
        15: "3.75rem",
        25: "6.25rem",
      },
      animation: {
        "progress": "progress 10s linear",
        "spin": "spin 2s linear infinite",
        "shake": "shake 0.3s linear infinite",
        "shake-reverse": "shake 0.3s linear reverse infinite",
      },
      backdropBlur: {
        DEFAULT: "var(--rad-backdrop-blur, 0)",
      },
      backgroundImage: {
        logo: 'url("@/assets/img/logo.svg")',
      },
      borderColor: ({ theme }) => ({
        DEFAULT: theme("colors.accent"),
      }),
      borderRadius: {
        DEFAULT: "var(--rad-border-radius, 0)",
      },
      borderWidth: ({ theme }) => ({
        DEFAULT: theme("spacing.borders"),
      }),
      boxShadow: {
        theme: "var(--rad-shadow)",
      },
      content: {
        comma: '","',
      },
      fontFamily: {
        sans: ['"Fira Sans"', ...defaultTheme.fontFamily.sans],
      },
      height: {
        tags: "var(--rad-station-tags-height)",
      },
      keyframes: {
        progress: {
          from: { transform: "scaleX(0)" },
        },
        shake: {
          "25%": { translate: "0 -1px" },
          "75%": { translate: "0 1px" },
        },
      },
      maxWidth: {
        sidebar: "29.375rem",
        230: "57.5rem",
      },
      padding: {
        "station": "var(--rad-station-padding-base)",
        "station-sm": "var(--rad-station-padding-small)",
        "station-inner": "var(--rad-station-padding-inner)",
      },
      transitionDuration: {
        DEFAULT: "300ms",
        2000: "2000ms",
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
