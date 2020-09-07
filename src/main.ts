import Vue from "vue";
import VShowSlide from "v-show-slide";

import App from "./App.vue";
import "./font-awesome";
import router from "./router";
import store from "./store";
import i18n from "./lang";

Vue.config.productionTip = false;
Vue.config.silent = process.env.NODE_ENV === "production";
Vue.config.devtools = true;

Vue.use(VShowSlide);

const app = new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount("#app");

if (process.env.NODE_ENV !== "production") {
  window.app = app;
}
