<template>
  <div class="mb-5">
    <strong>{{ $t("general.list") }}</strong
    >:
    <RadLink v-slot="{ active: listManagerShown, navigate: openListManager }" to="list-manager">
      <RadDropdown
        :value="selectedList"
        :actions="[$t('general.manage')]"
        :actions-enabled="!listManagerShown"
        :label="$t('general.stationLists')"
        :data="dropdownOptions"
        :aria-label="$t('general.stationLists')"
        @change="changeList"
        @actionSelect="openListManager"
      />
    </RadLink>
    {{ " " }}
    <RadLink v-slot="{ active, navigate }" to="import-wizard" :props="{ type: 'list' }" toggle>
      <a
        :class="{ 'text-accent icons:opacity-100': active }"
        :title="String($t('general.importBackup'))"
        @click="navigate"
      >
        <FasUpload class="w-fixed" />
      </a>
    </RadLink>
    {{ " " }}
    <RadDropdown
      :actions="[$t('general.cancel')]"
      :label="$t('general.downloadAs')"
      :data="downloadOptions"
      :title="$t('general.downloadPlaylist')"
      @change="exportList"
    >
      <FasDownload class="w-fixed" />
    </RadDropdown>
    {{ " " }}
    <RadLink v-slot="{ active, navigate }" to="list-manager" toggle>
      <a
        :class="{ 'text-accent icons:opacity-100': active }"
        :title="String($t('general.manageLists'))"
        @click="navigate"
      >
        <FasWrench class="w-fixed" />
      </a>
    </RadLink>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from "vue-property-decorator";
import { Getter } from "vuex-class";

import ListHelper from "@/mixins/ListHelper";

@Component
export default class RadListMenu extends Mixins(ListHelper) {
  appTitle = __APP_TITLE__;

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
