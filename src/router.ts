import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

import RadAbout from "./views/RadAbout.vue";
import RadEditor from "./views/RadEditor.vue";
import RadHotkeyReference from "./views/RadHotkeyReference.vue";
import RadImportWizard from "./views/RadImportWizard.vue";
import RadListManager from "./views/RadListManager.vue";
import RadMenu from "./views/RadMenu.vue";
import RadSearch from "./views/RadSearch.vue";
import RadSettings from "./views/RadSettings.vue";
import RadTitleManager from "./views/RadTitleManager.vue";

Vue.use(VueRouter);

const routes: RouteConfig[] = [
  {
    path: "/",
  },
  {
    path: "/about",
    component: RadAbout,
  },
  {
    path: "/editor",
    component: RadEditor,
    props: route => ({ list: Number(route.query.list), id: route.query.id }),
  },
  {
    path: "/hotkeys",
    component: RadHotkeyReference,
  },
  {
    path: "/import-wizard/:type",
    component: RadImportWizard,
    props: true,
  },
  {
    path: "/list-manager",
    component: RadListManager,
  },
  {
    path: "/menu",
    component: RadMenu,
  },
  {
    path: "/search",
    component: RadSearch,
  },
  {
    path: "/settings",
    component: RadSettings,
  },
  {
    path: "/title-manager",
    component: RadTitleManager,
  },
  {
    path: "*",
    redirect: "/menu",
  },
];

const router = new VueRouter({ routes });

export default router;
