const { ContextReplacementPlugin } = require("webpack");
const { version, author, homepage, bugs } = require("./package.json");

process.env.VUE_APP_TITLE = "Radiolise";
process.env.VUE_APP_VERSION = version;
process.env.VUE_APP_COPYRIGHT = `© 2017-${new Date().getFullYear()} ${author}`;
process.env.VUE_APP_REPO = homepage;
process.env.VUE_APP_ISSUES = bugs.url;

const dateFnsLocales = ["de", "fr" /*, "be", "ru" */];

module.exports = {
  publicPath: ".",
  productionSourceMap: false,

  configureWebpack: config => {
    config.plugins.push(
      new ContextReplacementPlugin(
        /date\-fns[\/\\]/,
        new RegExp(`[/\\\\\](${dateFnsLocales.join("|")})[/\\\\\]index\.js$`)
      )
    );
  },

  chainWebpack: config => {
    config.optimization.minimizer("terser").tap(args => {
      args[0].terserOptions.keep_classnames = true;
      return args;
    });

    config.plugin("prefetch").tap(options => {
      options[0].fileBlacklist = options[0].fileBlacklist || [];
      options[0].fileBlacklist.push(/date-fns-locale-(.)+?\.js$/);
      return options;
    });
  },
};
