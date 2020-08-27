const MomentLocalesPlugin = require("moment-locales-webpack-plugin");
const { version, author, homepage, bugs } = require("./package.json");

process.env.VUE_APP_TITLE = "Radiolise";
process.env.VUE_APP_VERSION = version;
process.env.VUE_APP_COPYRIGHT = `© 2017-${new Date().getFullYear()} ${author}`;
process.env.VUE_APP_REPO = homepage;
process.env.VUE_APP_ISSUES = bugs.url;

module.exports = {
  publicPath: ".",
  productionSourceMap: false,

  configureWebpack: config => {
    config.plugins.push(
      new MomentLocalesPlugin({
        localesToKeep: ["en", "de", "fr" /*, "be", "ru" */],
      })
    );
  },

  chainWebpack: config => {
    config.optimization.minimizer("terser").tap(args => {
      args[0].terserOptions.keep_classnames = true;
      return args;
    });
  },
};
