<template>
  <RadDrawer>
    <h3><FasCog class="w-fixed" /> {{ $t("general.settings") }}</h3>
    <p class="description py-2.5">
      {{ $t("settings.description", [appTitle]) }}
    </p>
    <form @submit.prevent="onSubmit()">
      <div v-if="settings !== null" class="text-left">
        <div class="ml-2.5 mt-5">
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
        <div class="ml-2.5 mt-5">
          <span class="description">{{ $t(`settings.themes.${settings.theme}`) }}</span>
        </div>
        <div class="ml-2.5 mt-5">
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
        <RadCheck v-model="settings.compactMode" class="ml-2.5 mt-5">
          {{ $t("settings.compactMode.name") }}
          <template #description>
            {{ $t("settings.compactMode.description") }}
          </template>
        </RadCheck>
        <RadCheck v-model="settings.externalPlayback" class="ml-2.5 mt-5">
          {{ $t("settings.externalPlayback.name") }}
          <template #description>
            {{ $t("settings.externalPlayback.description") }}
          </template>
        </RadCheck>
        <RadCheck v-model="settings.changecolor" class="ml-2.5 mt-5">
          {{ $t("settings.colorChange.name") }}
          <template #description>
            {{ $t("settings.colorChange.description") }}
          </template>
        </RadCheck>
        <RadCheck v-model="settings.visualization" class="ml-2.5 mt-5 mobile:opacity-50">
          {{ $t("settings.visualization.name") }}
          <span
            class="hidden mobile:inline"
            :title="String($t('settings.visualization.screenWidthIssue'))"
          >
            <FasExclamationTriangle />
          </span>
          <template #description>
            {{ $t("settings.visualization.description") }}
          </template>
        </RadCheck>
        <RadCheck v-model="settings.relax" class="ml-2.5 mt-5">
          {{ $t("settings.relaxMode.name") }}
          <template #description>
            {{ $t("settings.relaxMode.description") }}
          </template>
        </RadCheck>
        <div v-if="settings.relax" class="ml-2.5 mt-5">
          <strong>{{ $t("settings.relaxMode.timer") }}</strong>
          {{ " " }}
          <span class="opacity-70">(sec):</span>
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
        <RadCheck v-model="settings.sleep" class="ml-2.5 mt-5">
          {{ $t("settings.sleep.name") }}
          <template #description>
            {{ $t("settings.sleep.description") }}
          </template>
        </RadCheck>
        <div v-if="settings.sleep" class="ml-2.5 mt-5">
          <strong>{{ $t("settings.sleep.timer") }}</strong>
          {{ " " }}
          <span class="opacity-70">(min):</span>
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
        <RadCheck v-model="settings.loadpolicy" setting class="ml-2.5 mt-5">
          {{ $t("settings.loadIcons.name") }}
        </RadCheck>
        <div class="ml-2.5 mt-5">
          <strong>{{ $t("settings.volume") }}</strong>
          {{ " " }}
          <span class="opacity-70">(%):</span>
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
        <div class="ml-2.5 mt-5">
          <strong>{{ $t("settings.defaultPlaylistFormat") }}</strong
          >:
          <RadDropdown
            v-model="settings.defaultPlaylistFormat"
            :label="$t('settings.playlistFormats')"
            :data="[
              { id: 'xspf', name: 'XSPF' },
              { id: 'pls', name: 'PLS' },
              { id: 'm3u', name: 'M3U' },
            ]"
          />
        </div>
        <div class="mb-2.5 ml-2.5 mt-5">
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
      <div class="py-2.5 text-right">
        <RadLink v-slot="{ navigate }" :to="null">
          <RadButton @click="navigate" type="button">
            <FasBan />
            {{ $t("settings.discard") }}
          </RadButton>
        </RadLink>
        <RadButton @click="submitButton.click()" type="button">
          <FasCheck />
          {{ $t("general.apply") }}
        </RadButton>
        <input ref="submit" type="submit" name="submit" hidden />
      </div>
    </form>
    <div class="my-2.5 flow-root">
      <div class="float-left mx-2.5 my-1.25">
        <button class="ring-inset ring-accent focus-visible:ring-2" @click="reset()">
          <FasUndo class="w-fixed" />{{ $t("settings.reset") }}</button
        ><br />
      </div>
      <div class="float-right mx-2.5 my-1.25">
        <RadLink v-slot="{ navigate }" to="import-wizard" :props="{ type: 'settings' }">
          <button class="ring-inset ring-accent focus-visible:ring-2" @click="navigate">
            <FasUpload class="w-fixed" />{{ $t("settings.import") }}
          </button>
        </RadLink>
        <br />
        <button class="ring-inset ring-accent focus-visible:ring-2" @click="exportSettings()">
          <FasDownload class="w-fixed" />{{ $t("settings.export") }}
        </button>
      </div>
    </div>
  </RadDrawer>
</template>

<script lang="ts">
import { Component, Ref, Watch, Vue } from "vue-property-decorator";
import { State, Getter, Action } from "vuex-class";

import { saveFile, convertToYaml } from "@/common/downloader";
import { navigate } from "@/common/routing";

@Component
export default class RadSettings extends Vue {
  appTitle = __APP_TITLE__;
  settings: Settings | null = null;

  @Ref("submit") readonly submitButton!: HTMLInputElement;

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
      { id: "nl", name: "Nederlands" },
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
