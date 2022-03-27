<template>
  <RadDrawer id="menu" is-menu>
    <h3><FaIcon icon="bars" fixed-width /> {{ $t("general.menu") }}</h3>
    <RadLink v-slot="{ navigate }" to="search">
      <button @click="navigate">
        <FaIcon icon="search" fixed-width />
        {{ $t("general.findStations") }}
      </button>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="list-manager">
      <button @click="navigate">
        <FaIcon icon="list-alt" fixed-width />
        {{ $t("general.manageLists") }}
      </button>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="title-manager">
      <button @click="navigate">
        <FaIcon icon="history" fixed-width />
        {{ $t("general.manageTitles") }}
      </button>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="import-wizard" :props="{ type: 'list' }">
      <button @click="navigate">
        <FaIcon icon="file-import" fixed-width />
        {{ $t("general.importBackup") }}
      </button>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="hotkeys">
      <button @click="navigate">
        <FaIcon icon="keyboard" fixed-width />
        {{ $t("general.hotkeys") }}
      </button>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="settings">
      <button @click="navigate">
        <FaIcon icon="cog" fixed-width />
        {{ $t("general.settings") }}
      </button>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="about">
      <button @click="navigate">
        <FaIcon icon="info-circle" fixed-width />
        {{ $t("general.learnMore") }}
      </button>
    </RadLink>
    <div class="button-group text-right">
      <RadLink v-slot="{ navigate }" :to="null">
        <a class="button" @click="navigate">
          <FaIcon icon="times" fixed-width /> {{ $t("menu.close") }}
        </a>
      </RadLink>
    </div>
  </RadDrawer>
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
