<template>
  <RadDrawer class="icons:w-fixed" is-menu>
    <h3><FasBars /> {{ $t("general.menu") }}</h3>
    <RadLink v-slot="{ navigate }" to="search">
      <RadMenuButton class="w-full text-left" @click="navigate">
        <FasSearch />
        {{ $t("general.findStations") }}
      </RadMenuButton>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="list-manager">
      <RadMenuButton class="w-full text-left" @click="navigate">
        <FasListAlt />
        {{ $t("general.manageLists") }}
      </RadMenuButton>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="title-manager">
      <RadMenuButton class="w-full text-left" @click="navigate">
        <FasHistory />
        {{ $t("general.manageTitles") }}
      </RadMenuButton>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="import-wizard" :props="{ type: 'list' }">
      <RadMenuButton class="w-full text-left" @click="navigate">
        <FasFileImport />
        {{ $t("general.importBackup") }}
      </RadMenuButton>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="hotkeys">
      <RadMenuButton class="w-full text-left" @click="navigate">
        <FasKeyboard />
        {{ $t("general.hotkeys") }}
      </RadMenuButton>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="settings">
      <RadMenuButton class="w-full text-left" @click="navigate">
        <FasCog />
        {{ $t("general.settings") }}
      </RadMenuButton>
    </RadLink>
    <RadLink v-slot="{ navigate }" to="about">
      <RadMenuButton class="w-full text-left" @click="navigate">
        <FasInfoCircle />
        {{ $t("general.learnMore") }}
      </RadMenuButton>
    </RadLink>
    <div class="py-2.5 text-right">
      <RadLink v-slot="{ navigate }" :to="null">
        <RadButton @click="navigate"><FasTimes /> {{ $t("menu.close") }}</RadButton>
      </RadLink>
    </div>
  </RadDrawer>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import RadButton from "@/components/RadButton.vue";
import RadDrawer from "@/components/RadDrawer.vue";
import RadLink from "@/components/RadLink.vue";
import RadMenuButton from "@/components/RadMenuButton.vue";

@Component({
  components: {
    RadButton,
    RadDrawer,
    RadLink,
    RadMenuButton,
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
