<template>
  <div class="list-menu">
    <strong>{{ $t("general.list") }}</strong
    >:
    <rad-link
      v-slot="{ active: listManagerShown, navigate: openListManager }"
      to="list-manager"
    >
      <rad-dropdown
        id="lists"
        :value="selectedList"
        :actions="[$t('general.manage')]"
        :actions-enabled="!listManagerShown"
        :label="$t('general.stationLists')"
        :data="dropdownOptions"
        :aria-label="$t('general.stationLists')"
        @change="changeList"
        @actionSelect="openListManager"
      />
    </rad-link>
    {{ " " }}
    <rad-link
      v-slot="{ active, navigate }"
      to="import-wizard"
      :props="{ type: 'list' }"
      toggle
    >
      <a
        :class="{ active }"
        :title="$t('general.importBackup')"
        @click="navigate"
      >
        <font-awesome-icon icon="upload" fixed-width />
      </a>
    </rad-link>
    {{ " " }}
    <rad-dropdown
      :actions="[$t('general.cancel')]"
      :label="$t('general.downloadAs')"
      :data="downloadOptions"
      :title="$t('general.downloadPlaylist')"
      @change="exportList"
    >
      <font-awesome-icon icon="download" fixed-width />
    </rad-dropdown>
    {{ " " }}
    <rad-link v-slot="{ active, navigate }" to="list-manager" toggle>
      <a
        :class="{ active }"
        :title="$t('general.manageLists')"
        @click="navigate"
      >
        <font-awesome-icon icon="wrench" fixed-width />
      </a>
    </rad-link>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from "vue-property-decorator";
import { Getter } from "vuex-class";

import RadDropdown from "./RadDropdown.vue";
import RadLink from "./RadLink.vue";

import ListHelper from "@/mixins/ListHelper";

@Component({
  components: {
    RadDropdown,
    RadLink,
  },
})
export default class RadListMenu extends Mixins(ListHelper) {
  appTitle = process.env.VUE_APP_TITLE;

  @Getter readonly currentList!: Station[];
  @Getter readonly listName!: string;
  @Getter readonly lists!: StationList[];
  @Getter readonly selectedList!: number;

  get dropdownOptions(): DropdownOption[] {
    return this.lists.map((list, index) => ({
      id: index,
      name: list.name,
      description: list.content.length,
    }));
  }

  get downloadOptions(): DropdownOption[] {
    const yamlLabel = this.$t("general.yamlFile", [this.appTitle]) as string;

    return [
      { id: "txt", name: yamlLabel },
      { id: "xspf", name: "XSPF" },
      { id: "pls", name: "PLS" },
      { id: "m3u", name: "M3U" },
    ];
  }

  exportList(type: string): void {
    this.download({
      name: this.listName,
      type,
      content: this.currentList,
    });
  }
}
</script>

<style scoped>
.list-menu {
  margin-bottom: 20px;
}
</style>
