<template>
  <rad-drawer id="import-wizard">
    <h3>
      <font-awesome-icon icon="file-import" fixed-width />
      {{ $t("general.importBackup") }}
    </h3>
    <p class="description">
      {{
        $t("importWizard.description", [
          $t(`importWizard.${type === "list" ? "stationLists" : "settings"}`),
        ])
      }}
    </p>
    <div class="text-left">
      <div>
        <h4>
          <template v-if="type === 'list'">
            {{ $t("importWizard.step", [1, $t("importWizard.chooseFile")]) }}
          </template>
          <template v-else>
            {{ $t("importWizard.chooseFile") }}
          </template>
        </h4>
        <rad-drop-zone ref="dropZone" @change="setBackup" />
      </div>
      <template v-if="backup">
        <br />
        <template v-if="type === 'list'">
          <br />
          <div>
            <h4>
              {{ $t("importWizard.step", [2, $t("importWizard.setName")]) }}
            </h4>
            <div style="display: inline-block">
              <input
                v-model="listName"
                autocomplete="off"
                type="text"
                :placeholder="$t('general.newName')"
                class="itemname"
                spellcheck="false"
              />
            </div>
          </div>
          <br /><br />
          <div>
            <h4>
              {{
                $t("importWizard.step", [3, $t("importWizard.selectStations")])
              }}
            </h4>
            <div v-if="backup">
              <rad-result
                v-for="(station, index) in backup"
                :key="index"
                v-model="station.selected"
              >
                {{ station.name }}
                <template #tags>
                  <rad-tags
                    :labels="[
                      station.country,
                      station.state,
                      ...station.tags.split(','),
                    ]"
                  ></rad-tags>
                </template>
              </rad-result>
            </div>
          </div>
          <br />
        </template>
        <div style="text-align: right">
          <router-link class="button" :to="type === 'list' ? '/' : '/settings'">
            <font-awesome-icon icon="ban" /> {{ $t("general.cancel") }}
          </router-link>
          <a class="button" @click="importItems()">
            <font-awesome-icon icon="arrow-right" /> {{ $t("general.apply") }}
          </a>
        </div>
      </template>
    </div>
  </rad-drawer>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from "vue-property-decorator";
import { Action } from "vuex-class";
import { ModalOptions, ModalType } from "@/store";

import RadDrawer from "@/components/RadDrawer.vue";
import RadDropZone from "@/components/RadDropZone.vue";
import RadTags from "@/components/RadTags.vue";
import RadResult from "@/components/RadResult.vue";

type BackupKind = Record<string, Station[]> | Settings;
type Backup = Record<string, string | BackupKind>;

@Component({
  components: {
    RadDrawer,
    RadDropZone,
    RadTags,
    RadResult,
  },
})
export default class RadImportWizard extends Vue {
  appTitle = process.env.VUE_APP_TITLE;
  backup: SelectableStation[] | Settings | null = null;
  listName?: string;

  @Prop({ type: String, required: true }) readonly type!: string;

  @Ref() readonly dropZone!: RadDropZone;

  @Action applySettings!: (settings: Settings) => Promise<void>;
  @Action changeList!: (index: number) => Promise<void>;
  @Action createList!: (list: StationList) => Promise<void>;
  @Action showMessage!: (options: ModalOptions) => Promise<number>;

  @Action updateList!: (payload: {
    name?: string;
    content: Station[];
  }) => Promise<void>;

  setBackup(rawBackup: Backup): void {
    try {
      if (rawBackup.version !== "2" || this.type !== rawBackup.type) {
        throw new Error("File not supported");
      }

      const backup = rawBackup.data;

      if (this.type === "settings") {
        this.backup = backup as Settings;
        return;
      }

      const entries = Object.entries(backup)[0] as [string, Station[]];
      [this.listName] = entries;

      this.backup = entries[1].map((item: Station) => ({
        ...item,
        selected: true,
      }));
    } catch {
      this.showMessage({
        type: ModalType.ERROR,
        buttons: [this.$t("general.ok") as string],
        title: this.$t("general.error.fileNotSupported.title") as string,
        message: this.$t("general.error.fileNotSupported.description", [
          this.appTitle,
        ]) as string,
      });

      if (this.backup === null) {
        this.dropZone.reset();
      }
    }
  }

  async importItems(): Promise<void> {
    if (this.type === "settings") {
      this.applySettings(this.backup as Settings);
      this.$router.push("/settings");
      return;
    }

    const name = this.listName as string;

    const removeSelected = ({
      selected,
      ...station
    }: SelectableStation): Station => station;

    const content = (this.backup as SelectableStation[])
      .filter((station: SelectableStation) => station.selected)
      .map((item: SelectableStation) => removeSelected(item));

    try {
      this.createList({ name, content });
      await this.$nextTick();
      this.changeList(-1);
      this.$router.push("/");
    } catch (error) {
      if (error.message.includes("empty")) {
        this.showMessage({
          type: ModalType.WARNING,
          buttons: [this.$t("general.ok") as string],
          title: this.$t("importWizard.emptyName.title") as string,
          message: this.$t("importWizard.emptyName.description") as string,
        });
      } else {
        const buttonId = await this.showMessage({
          type: ModalType.QUESTION,
          title: this.$t("importWizard.nameTaken.title") as string,
          message: this.$t("importWizard.nameTaken.description") as string,
          buttons: [
            this.$t("general.yes") as string,
            this.$t("general.no") as string,
          ],
          closeable: false,
        });

        if (buttonId === 0) {
          this.$router.push("/");
          this.updateList({ name, content });
        }
      }
    }
  }
}
</script>
