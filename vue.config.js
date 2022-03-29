const { defineConfig } = require("@vue/cli-service");
const { ContextReplacementPlugin } = require("webpack");
const Icons = require("unplugin-icons/webpack");
const IconsResolver = require("unplugin-icons/resolver");
const AutoImport = require("unplugin-auto-import/webpack");
const { version, author, homepage, bugs } = require("./package.json");

process.env.VUE_APP_TITLE = "Radiolise";
process.env.VUE_APP_VERSION = version;
process.env.VUE_APP_COPYRIGHT = `© 2017-${new Date().getUTCFullYear()} ${author}`;
process.env.VUE_APP_REPO = homepage;
process.env.VUE_APP_ISSUES = bugs.url;

const DATE_FNS_LOCALES = ["de", "fr"];

module.exports = defineConfig({
  publicPath: ".",
  productionSourceMap: false,
  terser: {
    terserOptions: {
      keep_classnames: true,
    },
  },
  configureWebpack: {
    plugins: [
      AutoImport({
        resolvers: [
          IconsResolver({
            prefix: false,
            alias: {
              fas: "fa-solid",
              far: "fa-regular",
              fab: "fa-brands",
            },
            enabledCollections: ["fa-solid", "fa-regular", "fa-brands"],
          }),
        ],
      }),
      Icons({
        scale: 1,
        compiler: "vue2",
        defaultClass: "icon",
        iconCustomizer: (_collection, _icon, props) => {
          const [width, height] = props.viewBox.split(" ").slice(2);
          props.width = `${width / height}em`;
        },
      }),
      new ContextReplacementPlugin(
        /^date-fns[/\\]locale$/,
        new RegExp(`\\.[/\\\\](${DATE_FNS_LOCALES.join("|")})[/\\\\]index\\.js$`)
      ),
    ],
  },
});
