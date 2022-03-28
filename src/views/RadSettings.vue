<template>
  <RadDrawer>
    <h3><FasCog class="w-fixed" /> {{ $t("general.settings") }}</h3>
    <p class="description">{{ $t("settings.description", [appTitle]) }}</p>
    <form ref="form" @submit.prevent="onSubmit()">
      <div v-if="settings !== null" id="control-panel">
        <div>
          <strong>{{ $tc("settings.theme", 1) }}</strong
          >:
          <RadDropdown
            v-model="settings.theme"
            :label="$tc('settings.theme', 0)"
            :data="[
              { id: 'candy', name: 'Candy' },
              { id: 'pure', name: 'Pure' },
            ]"
          />
        </div>
        <div>
          <span class="description">{{ $t(`settings.themes.${settings.theme}`) }}</span>
        </div>
        <div>
          <strong>{{ $tc("settings.colorScheme.name") }}</strong
          >:
          <RadDropdown
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
        <RadCheck v-model="settings.compactMode">
          {{ $t("settings.compactMode.name") }}
          <template #description>
            {{ $t("settings.compactMode.description") }}
          </template>
        </RadCheck>
        <RadCheck v-model="settings.changecolor">
          {{ $t("settings.colorChange.name") }}
          <template #description>
            {{ $t("settings.colorChange.description") }}
          </template>
        </RadCheck>
        <RadCheck id="visualization-setting" v-model="settings.visualization">
          {{ $t("settings.visualization.name") }}
          <span :title="$t('settings.visualization.screenWidthIssue')">
            <FasExclamationTriangle />
          </span>
          <template #description>
            {{ $t("settings.visualization.description") }}
          </template>
        </RadCheck>
        <RadCheck v-model="settings.relax">
          {{ $t("settings.relaxMode.name") }}
          <template #description>
            {{ $t("settings.relaxMode.description") }}
          </template>
        </RadCheck>
        <div v-if="settings.relax">
          <strong>{{ $t("settings.relaxMode.timer") }}</strong>
          {{ " " }}
          <span style="opacity: 0.7">(sec):</span>
          {{ " " }}
          <RadInput
            v-model.number="settings.relaxTimeout"
            type="number"
            select-on-focus
            min="1"
            step="1"
            required
          />
        </div>
        <RadCheck v-model="settings.sleep">
          {{ $t("settings.sleep.name") }}
          <template #description>
            {{ $t("settings.sleep.description") }}
          </template>
        </RadCheck>
        <div v-if="settings.sleep">
          <strong>{{ $t("settings.sleep.timer") }}</strong>
          {{ " " }}
          <span style="opacity: 0.7">(min):</span>
          {{ " " }}
          <RadInput
            v-model.number="settings.sleepTimeout"
            type="number"
            select-on-focus
            min="1"
            step="1"
            required
          />
        </div>
        <RadCheck v-model="settings.loadpolicy" setting>
          {{ $t("settings.loadIcons.name") }}
        </RadCheck>
        <RadCheck v-model="settings.transitions" setting>
          {{ $t("settings.transitions.name") }}
        </RadCheck>
        <div>
          <strong>{{ $t("settings.volume") }}</strong>
          {{ " " }}
          <span style="opacity: 0.7">(%):</span>
          {{ " " }}
          <RadInput
            v-model.number="settings.volume"
            type="number"
            select-on-focus
            min="0"
            max="100"
            step="1"
            required
          />
        </div>
        <div>
          <FasCommentDots class="-scale-x-100" />{{ " " }}
          <strong>{{ $tc("general.language", 1) }}</strong
          >:
          <RadDropdown
            v-model="settings.language"
            :label="$tc('general.language', 0)"
            :data="locales"
          />
        </div>
      </div>
      <div class="button-group text-right">
        <RadLink v-slot="{ navigate }" :to="null">
          <a class="button" @click="navigate"><FasBan /> {{ $t("settings.discard") }}</a>
        </RadLink>
        <a class="button" @click="form.submit.click()">
          <FasCheck />
          {{ $t("general.apply") }}
        </a>
        <input type="submit" name="submit" style="display: none" />
      </div>
    </form>
    <div style="display: table; margin: 10px auto">
      <div style="float: left; margin: 5px 10px">
        <a @click="reset()"><FasUndo class="w-fixed" />{{ $t("settings.reset") }}</a
        ><br />
      </div>
      <div style="float: right; margin: 5px 10px">
        <RadLink v-slot="{ navigate }" to="import-wizard" :props="{ type: 'settings' }">
          <a @click="navigate"><FasUpload class="w-fixed" />{{ $t("settings.import") }}</a>
        </RadLink>
        <br />
        <a @click="exportSettings()">
          <FasDownload class="w-fixed" />{{ $t("settings.export") }}
        </a>
      </div>
    </div>
  </RadDrawer>
</template>

<script lang="ts">
import { Component, Ref, Watch, Vue } from "vue-property-decorator";
import { State, Getter, Action } from "vuex-class";

import { saveFile, convertToYaml } from "@/common/downloader";
import { navigate } from "@/common/routing";

import RadCheck from "@/components/RadCheck.vue";
import RadDrawer from "@/components/RadDrawer.vue";
import RadDropdown from "@/components/RadDropdown.vue";
import RadInput from "@/components/RadInput.vue";
import RadLink from "@/components/RadLink.vue";

@Component({
  components: {
    RadCheck,
    RadDrawer,
    RadDropdown,
    RadInput,
    RadLink,
    FasCog,
    FasExclamationTriangle,
    FasCommentDots,
    FasBan,
    FasCheck,
    FasUndo,
    FasUpload,
    FasDownload,
  },
})
export default class RadSettings extends Vue {
  appTitle = process.env.VUE_APP_TITLE;
  settings: Settings | null = null;

  @Ref() readonly form!: HTMLFormElement;

  @State readonly darkMode!: boolean;

  @Getter("settings") readonly globalSettings!: Settings;

  @Action applySettings!: (settings: Settings | null) => Promise<void>;
  @Action("reset") onReset!: () => Promise<void>;

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
        ...(this.globalSettings.language === "auto" ? { description: this.$i18n.locale } : {}),
      },
      { id: "en", name: "English" },
      { id: "de", name: "Deutsch" },
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
    this.onReset();
    this.initialize();
  }

  @Watch("globalSettings.compactMode")
  onCompactModeToggled(compact: boolean) {
    (this.settings as Settings).compactMode = compact;
  }

  onSubmit(): void {
    this.applySettings(this.settings);
    navigate(null);
  }

  async exportSettings(): Promise<void> {
    if (this.settings === null) {
      return;
    }

    saveFile({
      name: "Settings",
      type: "txt",
      output: await convertToYaml({
        version: "2",
        type: "settings",
        data: this.settings,
      }),
    });
  }
}
</script>

<style scoped>
#control-panel {
  text-align: left;
}
#control-panel > div {
  margin: 20px 0 10px 10px;
}
#visualization-setting span {
  display: none;
}
@media (max-width: 820px) {
  #visualization-setting {
    opacity: 0.5;
  }
  #visualization-setting span {
    display: initial;
  }
}
</style>
