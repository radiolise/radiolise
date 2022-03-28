<template>
  <RadDrawer id="menu" class="icons:w-fixed" is-menu>
    <h3><FasBars /> {{ $t("general.menu") }}</h3>
    <RadLink v-slot="{ navigate }" to="search">
      <button @click="navigate">
        <FasSearch />
        {{ $t("general.findStations") }}
      </button>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="list-manager">
      <button @click="navigate">
        <FasListAlt />
        {{ $t("general.manageLists") }}
      </button>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="title-manager">
      <button @click="navigate">
        <FasHistory />
        {{ $t("general.manageTitles") }}
      </button>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="import-wizard" :props="{ type: 'list' }">
      <button @click="navigate">
        <FasFileImport />
        {{ $t("general.importBackup") }}
      </button>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="hotkeys">
      <button @click="navigate">
        <FasKeyboard />
        {{ $t("general.hotkeys") }}
      </button>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="settings">
      <button @click="navigate">
        <FasCog />
        {{ $t("general.settings") }}
      </button>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="about">
      <button @click="navigate">
        <FasInfoCircle />
        {{ $t("general.learnMore") }}
      </button>
    </RadLink>
    <div class="button-group text-right">
      <RadLink v-slot="{ navigate }" :to="null">
        <a class="button" @click="navigate"><FasTimes /> {{ $t("menu.close") }}</a>
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
    FasBars,
    FasSearch,
    FasListAlt,
    FasHistory,
    FasFileImport,
    FasKeyboard,
    FasCog,
    FasInfoCircle,
    FasTimes,
  },
})
export default class RadMenu extends Vue {}
</script>
