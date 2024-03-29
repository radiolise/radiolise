import Vue from "vue";
import VShowSlide from "v-show-slide";

import App from "./App.vue";
import store from "./store";
import i18n from "./lang";

import "./assets/css/index.css";

Vue.config.productionTip = false;
Vue.config.silent = import.meta.env.MODE === "production";
Vue.config.devtools = true;

Vue.use(VShowSlide);

const app = new Vue({
  store,
  i18n,
  render: (h) => h(App),
}).$mount("#app");

if (import.meta.env.MODE !== "production") {
  window.app = app;
}
