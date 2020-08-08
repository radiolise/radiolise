const MomentLocalesPlugin = require("moment-locales-webpack-plugin");

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
