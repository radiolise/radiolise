<template>
  <rad-drawer id="menu" is-menu>
    <h3>
      <font-awesome-icon icon="bars" fixed-width /> {{ $t("general.menu") }}
    </h3>
    <router-link v-slot="{ navigate }" to="/search" custom>
      <button @click="navigate">
        <font-awesome-icon icon="search" fixed-width />
        {{ $t("general.findStations") }}
      </button>
    </router-link>
    <router-link v-slot="{ navigate }" to="/list-manager" custom>
      <button @click="navigate">
        <font-awesome-icon icon="list-alt" fixed-width />
        {{ $t("general.manageLists") }}
      </button>
    </router-link>
    <router-link v-slot="{ navigate }" to="/title-manager" custom>
      <button @click="navigate">
        <font-awesome-icon icon="history" fixed-width />
        {{ $t("general.manageTitles") }}
      </button>
    </router-link>
    <router-link v-slot="{ navigate }" to="/import-wizard/list" custom>
      <button @click="navigate">
        <font-awesome-icon icon="file-import" fixed-width />
        {{ $t("general.importBackup") }}
      </button>
    </router-link>
    <router-link v-slot="{ navigate }" to="/hotkeys" custom>
      <button @click="navigate">
        <font-awesome-icon icon="keyboard" fixed-width />
        {{ $t("general.hotkeys") }}
      </button>
    </router-link>
    <router-link v-slot="{ navigate }" to="/settings" custom>
      <button @click="navigate">
        <font-awesome-icon icon="cog" fixed-width />
        {{ $t("general.settings") }}
      </button>
    </router-link>
    <router-link v-slot="{ navigate }" to="/about" custom>
      <button @click="navigate">
        <font-awesome-icon icon="info-circle" fixed-width />
        {{ $t("general.learnMore") }}
      </button>
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
