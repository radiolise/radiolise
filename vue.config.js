const { defineConfig } = require("@vue/cli-service");
const { ContextReplacementPlugin } = require("webpack");
const { version, author, homepage, bugs } = require("./package.json");

process.env.VUE_APP_TITLE = "Radiolise";
process.env.VUE_APP_VERSION = version;
process.env.VUE_APP_COPYRIGHT = `© 2017-${new Date().getUTCFullYear()} ${author}`;
process.env.VUE_APP_REPO = homepage;
process.env.VUE_APP_ISSUES = bugs.url;

const DATE_FNS_LOCALES = ["de", "fr"];
const THEME_PATTERN = /\.lazy\.css$/;

module.exports = defineConfig({
  publicPath: ".",
  productionSourceMap: false,
  terser: {
    terserOptions: {
      keep_classnames: true,
    },
  },
  configureWebpack: {
    module: {
      rules: [
        {
          test: THEME_PATTERN,
          use: [
            {
              loader: "style-loader",
              options: {
                injectType: "lazyStyleTag",
              },
            },
            "css-loader",
          ],
        },
      ],
    },
    plugins: [
      new ContextReplacementPlugin(
        /^date-fns[/\\]locale$/,
        new RegExp(`\\.[/\\\\](${DATE_FNS_LOCALES.join("|")})[/\\\\]index\\.js$`)
      ),
    ],
  },
  chainWebpack: (config) => {
    config.module.rule("css").exclude.store = [THEME_PATTERN];
  },
});
