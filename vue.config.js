const MomentLocalesPlugin = require("moment-locales-webpack-plugin");

module.exports = {
  publicPath: ".",
  productionSourceMap: false,

  configureWebpack(config) {
    config.plugins.push(
      new MomentLocalesPlugin({ localesToKeep: ["en", "de", "be", "ru"] })
    );
  },
};
