import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue2 from "@vitejs/plugin-vue2";
import icons from "unplugin-icons/vite";
import iconsResolver from "unplugin-icons/resolver";
import components from "unplugin-vue-components/vite";

import { version, author, homepage, bugs } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  define: {
    __APP_TITLE__: '"Radiolise"',
    __APP_VERSION__: `"${version}"`,
    __APP_COPYRIGHT__: `"© 2017-${new Date().getUTCFullYear()} ${author}"`,
    __APP_REPO__: `"${homepage}"`,
    __APP_ISSUES__: `"${bugs}"`,
    __METADATA_SOCKET__: `\`${
      process.env.RADIOLISE_METADATA_SOCKET ||
      '${location.protocol.replace("http", "ws")}//${location.host}/api/data-service'
    }\``,
  },
  plugins: [
    vue2(),
    components({
      transformer: "vue2",
      dts: "src/components.d.ts",
      resolvers: [
        iconsResolver({
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
    icons({
      scale: 1,
      compiler: "vue2",
      defaultClass: "icon",
      iconCustomizer: (_collection, _icon, props) => {
        const [width, height] = props.viewBox.split(" ").slice(2).map(Number);
        props.width = `${width / height}em`;
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
});
