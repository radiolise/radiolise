<template>
  <rad-drawer id="menu" is-menu>
    <h3><fa-icon icon="bars" fixed-width /> {{ $t("general.menu") }}</h3>
    <rad-link v-slot="{ navigate }" to="search">
      <button @click="navigate">
        <fa-icon icon="search" fixed-width />
        {{ $t("general.findStations") }}
      </button>
    </rad-link>
    <rad-link v-slot="{ navigate }" to="list-manager">
      <button @click="navigate">
        <fa-icon icon="list-alt" fixed-width />
        {{ $t("general.manageLists") }}
      </button>
    </rad-link>
    <rad-link v-slot="{ navigate }" to="title-manager">
      <button @click="navigate">
        <fa-icon icon="history" fixed-width />
        {{ $t("general.manageTitles") }}
      </button>
    </rad-link>
    <rad-link
      v-slot="{ navigate }"
      to="import-wizard"
      :props="{ type: 'list' }"
    >
      <button @click="navigate">
        <fa-icon icon="file-import" fixed-width />
        {{ $t("general.importBackup") }}
      </button>
    </rad-link>
    <rad-link v-slot="{ navigate }" to="hotkeys">
      <button @click="navigate">
        <fa-icon icon="keyboard" fixed-width />
        {{ $t("general.hotkeys") }}
      </button>
    </rad-link>
    <rad-link v-slot="{ navigate }" to="settings">
      <button @click="navigate">
        <fa-icon icon="cog" fixed-width />
        {{ $t("general.settings") }}
      </button>
    </rad-link>
    <rad-link v-slot="{ navigate }" to="about">
      <button @click="navigate">
        <fa-icon icon="info-circle" fixed-width />
        {{ $t("general.learnMore") }}
      </button>
    </rad-link>
    <div class="button-group text-right">
      <rad-link v-slot="{ navigate }" :to="null">
        <a class="button" @click="navigate">
          <fa-icon icon="times" fixed-width /> {{ $t("menu.close") }}
        </a>
      </rad-link>
    </div>
  </rad-drawer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import RadDrawer from "@/components/RadDrawer.vue";
import RadLink from "@/components/RadLink.vue";

@Component({
  components: {
    RadDrawer,
    RadLink,
  },
})
export default class RadMenu extends Vue {}
</script>
