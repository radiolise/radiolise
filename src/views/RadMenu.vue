<template>
  <rad-drawer id="menu" is-menu>
    <h3>
      <font-awesome-icon icon="bars" fixed-width /> {{ $t("general.menu") }}
    </h3>
    <router-link to="/search" tag="button">
      <font-awesome-icon icon="search" fixed-width />
      {{ $t("general.findStations") }}
    </router-link>
    <router-link to="/list-manager" tag="button">
      <font-awesome-icon icon="list-alt" fixed-width />
      {{ $t("general.manageLists") }}
    </router-link>
    <router-link to="/title-manager" tag="button">
      <font-awesome-icon icon="history" fixed-width />
      {{ $t("general.manageTitles") }}
    </router-link>
    <router-link to="/import-wizard/list" tag="button">
      <font-awesome-icon icon="file-import" fixed-width />
      {{ $t("general.importBackup") }}
    </router-link>
    <router-link to="/hotkeys" tag="button">
      <font-awesome-icon icon="keyboard" fixed-width />
      {{ $t("general.hotkeys") }}
    </router-link>
    <router-link to="/settings" tag="button">
      <font-awesome-icon icon="cog" fixed-width /> {{ $t("general.settings") }}
    </router-link>
    <router-link to="/about" tag="button">
      <font-awesome-icon icon="info-circle" fixed-width />
      {{ $t("general.learnMore") }}
    </router-link>
    <div class="text-right">
      <router-link to="/" class="button">
        <font-awesome-icon icon="times" fixed-width /> {{ $t("menu.close") }}
      </router-link>
    </div>
  </rad-drawer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import RadDrawer from "@/components/RadDrawer.vue";

@Component({
  components: {
    RadDrawer,
  },
})
export default class RadMenu extends Vue {}
</script>
