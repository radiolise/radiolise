<template>
  <div class="listMenu">
    <strong>{{ $t("general.list") }}</strong
    >:
    <rad-dropdown
      id="lists"
      :value="selectedList"
      :actions="[$t('general.manage')]"
      :actions-enabled="this.$route.path !== '/list-manager'"
      :label="$t('general.stationLists')"
      :data="dropdownOptions"
      :aria-label="$t('general.stationLists')"
      @change="changeList"
      @actionSelect="$router.push('/list-manager')"
    />
    &nbsp;
    <rad-router-toggle
      :title="$t('general.importBackup')"
      to="/import-wizard/list"
    >
      <font-awesome-icon icon="upload" fixed-width />
    </rad-router-toggle>
    &nbsp;
    <rad-dropdown
      :actions="[$t('general.cancel')]"
      :label="$t('general.downloadAs')"
      :data="[
        { id: 'txt', name: $t('general.yamlFile', [appName]) },
        { id: 'pls', name: 'PLS' },
        { id: 'm3u', name: 'M3U' },
        { id: 'xspf', name: 'XSPF' },
      ]"
      :title="$t('general.downloadPlaylist')"
      @change="downloadList"
    >
      <font-awesome-icon icon="download" fixed-width />
    </rad-dropdown>
    &nbsp;
    <rad-router-toggle :title="$t('general.manageLists')" to="/list-manager">
      <font-awesome-icon icon="wrench" fixed-width />
    </rad-router-toggle>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import download from "@/utils/downloader";
import RadDropdown from "./RadDropdown.vue";
import RadRouterToggle from "./RadRouterToggle.vue";

import { ModalOptions } from "@/store";

@Component({
  components: {
    RadDropdown,
    RadRouterToggle,
  },
})
export default class RadListMenu extends Vue {
  @Getter readonly appName!: string;
  @Getter readonly currentList!: Station[];
  @Getter readonly listName!: string;
  @Getter readonly lists!: StationList[];
  @Getter readonly selectedList!: number;

  @Action changeList!: (index: number) => Promise<void>;
  @Action showMessage!: (options: ModalOptions) => Promise<number>;

  get dropdownOptions(): DropdownOption[] {
    return this.lists.map((list, index) => ({
      id: index,
      name: list.name,
      description: list.content.length,
    }));
  }

  downloadList(type: string): void {
    if (this.currentList.length === 0) {
      this.showMessage({
        buttons: [this.$t("general.ok") as string],
        message: this.$t("general.listEmpty[0]") as string,
      });

      return;
    }

    let output: Record<string, string | Record<string, Station[]>> | string;

    switch (type) {
      case "txt":
        output = {
          version: "2",
          type: "list",
          data: { [this.listName]: this.currentList },
        };

        break;

      case "pls":
        output = "[playlist]\n";

        this.currentList.forEach((item, index) => {
          output += `File${index + 1}=${item.url}\nTitle${index + 1}=${
            item.name
          }\n`;
        });

        output += "Version=2\n";
        break;

      case "m3u":
        output = "#EXTM3U\n";

        this.currentList.forEach(item => {
          output += `#EXTINF:-1,${item.name}\n${item.url}\n`;
        });

        break;

      case "xspf":
        output =
          '<?xml version="1.0" encoding="UTF-8"?>\n<playlist version="1" xmlns="http://xspf.org/ns/0/">\n  <trackList>\n';

        this.currentList.forEach(item => {
          output += `    <track>\n      <title>${item.name}</title>\n      <location>${item.url}</location>\n    </track>\n`;
        });

        output += "  </trackList>\n</playlist>\n";
        break;

      default:
        throw new Error(`Unknown output type '${type}'.`);
    }

    download({ name: this.listName, type, output });
  }
}
</script>

<style lang="less" scoped>
.listMenu {
  margin-bottom: 20px;
}
</style>
