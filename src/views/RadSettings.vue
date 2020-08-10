<template>
  <rad-drawer id="settings">
    <h3>
      <font-awesome-icon icon="cog" fixed-width /> {{ $t("general.settings") }}
    </h3>
    <p class="description">{{ $t("settings.description", [appName]) }}</p>
    <form
      ref="form"
      @submit.prevent="handleSubmit()"
      @keypress="handleKeyPress"
    >
      <div v-if="settings !== null" id="controlpanel">
        <div>
          <strong>{{ $tc("settings.theme", 1) }}</strong
          >:
          <rad-dropdown
            id="theme"
            v-model="settings.theme"
            :label="$tc('settings.theme', 0)"
            :data="[
              { id: 'candy', name: 'Candy' },
              { id: 'pure', name: 'Pure' },
            ]"
          />
        </div>
        <div id="descriptions">
          <span class="description">{{
            $t(`settings.themes.${settings.theme}`)
          }}</span>
        </div>
        <div>
          <strong>{{ $tc("settings.colorScheme.name") }}</strong
          >:
          <rad-dropdown
            v-model="settings.colorScheme"
            :label="$tc('settings.colorScheme.name', 3)"
            :data="[
              {
                id: 'auto',
                name: $t('settings.colorScheme.auto'),
                description: detectedTheme,
              },
              { id: 'light', name: $t('settings.colorScheme.light') },
              { id: 'dark', name: $t('settings.colorScheme.dark') },
            ]"
          />
        </div>
        <rad-check v-model="settings.changecolor">
          {{ $t("settings.colorChange.name") }}
          <template #description>
            {{ $t("settings.colorChange.description") }}
          </template>
        </rad-check>
        <rad-check id="pseudovsl" v-model="settings.visualization">
          {{ $t("settings.visualization.name") }}
          <font-awesome-icon
            class="toosmall"
            icon="exclamation-triangle"
            :title="$t('settings.visualization.screenWidthIssue')"
          />
          <template #description>
            {{ $t("settings.visualization.description") }}
          </template>
        </rad-check>
        <rad-check v-model="settings.relax">
          {{ $t("settings.relaxMode.name") }}
          <template #description>
            {{ $t("settings.relaxMode.description") }}
          </template>
        </rad-check>
        <div v-if="settings.relax">
          <strong>{{ $t("settings.relaxMode.timer") }}</strong> (sec):
          <input
            v-model.number="settings.relaxTimeout"
            type="number"
            min="1"
            step="1"
            required
          />
        </div>
        <rad-check v-model="settings.sleep">
          {{ $t("settings.sleep.name") }}
          <template #description>
            {{ $t("settings.sleep.description") }}
          </template>
        </rad-check>
        <div v-if="settings.sleep">
          <strong>{{ $t("settings.sleep.timer") }}</strong> (min):
          <input
            v-model.number="settings.sleepTimeout"
            type="number"
            min="1"
            step="1"
            required
          />
        </div>
        <rad-check v-model="settings.loadpolicy" setting>
          {{ $t("settings.loadIcons.name") }}
        </rad-check>
        <rad-check v-model="settings.transitions" setting>
          {{ $t("settings.transitions.name") }}
        </rad-check>
        <div>
          <strong>{{ $t("settings.volume") }}</strong> (%):
          <input
            id="defaultvolume"
            v-model.number="settings.volume"
            type="number"
            min="0"
            max="100"
            step="1"
            required
          />
        </div>
        <div>
          <font-awesome-icon icon="comment-dots" flip="horizontal" />&nbsp;
          <strong>{{ $tc("general.language", 1) }}</strong
          >:
          <rad-dropdown
            id="locales"
            v-model="settings.language"
            :label="$tc('general.language', 0)"
            :data="locales"
          />
        </div>
      </div>
      <div class="text-right">
        <router-link id="discardsettings" class="button" to="/">
          <font-awesome-icon icon="ban" /> {{ $t("settings.discard") }}
        </router-link>
        <a id="applysettings" class="button" @click="form.submit.click()">
          <font-awesome-icon icon="check" />
          {{ $t("general.apply") }}
        </a>
        <input type="submit" name="submit" style="display: none" />
      </div>
    </form>
    <div style="display: table; margin: 10px auto">
      <div style="float: left; margin: 5px 10px">
        <a id="reset" href="#/settings" @click="reset()"
          ><font-awesome-icon icon="undo" fixed-width />{{
            $t("settings.reset")
          }}</a
        ><br />
      </div>
      <div style="float: right; margin: 5px 10px">
        <router-link id="import" to="/import-wizard/settings">
          <font-awesome-icon icon="upload" fixed-width />{{
            $t("settings.import")
          }}</router-link
        ><br />
        <a id="export" href="#/settings" @click="exportSettings()"
          ><font-awesome-icon icon="download" fixed-width />{{
            $t("settings.export")
          }}</a
        >
      </div>
    </div>
  </rad-drawer>
</template>

<script lang="ts">
import { Component, Ref, Vue } from "vue-property-decorator";
import { State, Getter, Action } from "vuex-class";

import download from "@/utils/downloader";

import RadCheck from "@/components/RadCheck.vue";
import RadDrawer from "@/components/RadDrawer.vue";
import RadDropdown from "@/components/RadDropdown.vue";

@Component({
  components: {
    RadCheck,
    RadDrawer,
    RadDropdown,
  },
})
export default class RadSettings extends Vue {
  settings: Settings | null = null;

  @Ref() readonly form!: HTMLFormElement;

  @State readonly darkMode!: boolean;

  @Getter readonly appName!: string;
  @Getter("settings") readonly globalSettings!: Settings;

  @Action applySettings!: (settings: Settings | null) => void;
  @Action("reset") handleReset!: () => void;

  get detectedTheme(): string | undefined {
    return this.globalSettings.colorScheme === "auto"
      ? this.darkMode
        ? (this.$t("settings.colorScheme.dark") as string)
        : (this.$t("settings.colorScheme.light") as string)
      : undefined;
  }

  get locales(): DropdownOption[] {
    return [
      {
        id: "auto",
        name: this.$t("settings.detect") as string,
        description:
          this.globalSettings.language === "auto"
            ? this.$i18n.locale
            : undefined,
      },
      { id: "de", name: "Deutsch" },
      { id: "en", name: "English" },
      { id: "fr", name: "Français" },
    ];
  }

  initialize(): void {
    this.settings = { ...this.globalSettings };
  }

  created(): void {
    this.initialize();
  }

  reset(): void {
    this.handleReset();
    this.initialize();
  }

  handleSubmit(): void {
    this.applySettings(this.settings);
    this.$router.push("/");
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      event.preventDefault();
      const activeElement = document.activeElement as HTMLElement | null;

      if (activeElement?.tagName === "INPUT") {
        activeElement.blur();
      }
    }
  }

  exportSettings(): void {
    if (this.settings === null) {
      return;
    }

    download({
      name: "Settings",
      type: "txt",
      output: {
        version: "2",
        type: "settings",
        data: this.settings,
      },
    });
  }
}
</script>
