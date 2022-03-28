<template>
  <div
    id="app"
    ref="app"
    :class="{
      'colorful': colorful,
      'dialog': dialog,
      'dragging': dragging,
      'fixed-player': fixedPlayer,
      'fullscreen': fullscreen,
      'has-video': hasVideo,
      'no-transitions': !transitions,
      'no-navbar': !navbarShown,
    }"
    :style="{
      width: scrollbarWidth,
      background: backgroundColor,
    }"
    @scroll="handleFullscreenScroll()"
  >
    <template v-if="ready">
      <RadPage />
      <RadDialogLayer />
      <RadRelaxCaption v-if="relaxed" />
      <RadVisualization v-if="visualizationActive" />
    </template>
    <RadStartup v-else />
  </div>
</template>

<script lang="ts">
import { Component, Ref, Watch, Mixins } from "vue-property-decorator";
import { State, Getter, Action } from "vuex-class";
import { formatDuration } from "date-fns";

import { ModalType } from "./store";
import { navigate } from "./common/routing";

import ColorChanger from "./mixins/ColorChanger";
import Hotkeys from "./mixins/Hotkeys";
import LikeHelper from "./mixins/LikeHelper";

import RadDialogLayer from "./components/RadDialogLayer.vue";
import RadPage from "./components/RadPage.vue";
import RadRelaxCaption from "./components/RadRelaxCaption.vue";
import RadStartup from "./components/RadStartup.vue";
import RadVisualization from "./components/RadVisualization.vue";

const HelperMixins = Mixins(ColorChanger, Hotkeys, LikeHelper);

@Component({
  components: {
    RadDialogLayer,
    RadPage,
    RadRelaxCaption,
    RadStartup,
    RadVisualization,
  },
})
export default class App extends HelperMixins {
  navbarShown = true;
  scrollbarWidth = "";

  inputEventTypes: Array<keyof GlobalEventHandlersEventMap> = [
    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "wheel",
  ];

  @Ref() readonly app!: HTMLDivElement;

  @State readonly currentDialog!: DialogState | null;
  @State readonly fellAsleep!: boolean;
  @State readonly relaxed!: boolean;

  @Getter readonly colorScheme!: string | null;
  @Getter readonly dragging!: boolean;
  @Getter readonly fixedPlayer!: boolean;
  @Getter readonly language!: string;
  @Getter readonly lists!: StationList[];
  @Getter readonly ready!: boolean;
  @Getter readonly visualizationActive!: boolean;

  @Action confirmSleepTimer!: () => Promise<void>;
  @Action createList!: (list: StationList) => Promise<void>;

  @Action determineDateFnsLocale!: (locale: string) => Promise<Locale | undefined>;

  @Action loadStyle!: () => Promise<void>;
  @Action setDarkMode!: (darkMode: boolean) => Promise<void>;
  @Action setRelaxTimer!: () => Promise<void>;
  @Action unsetDateFnsLocale!: () => Promise<void>;

  get darkSchemeQuery(): MediaQueryList {
    return window.matchMedia("(prefers-color-scheme: dark)");
  }

  get dialog(): boolean {
    return this.currentDialog !== null;
  }

  get noOverflow(): boolean {
    return this.dialog || this.relaxed;
  }

  get relaxModeAllowed(): boolean {
    return this.settings.relax && this.playing && !this.hasVideo;
  }

  get transitions(): boolean {
    return this.settings.transitions;
  }

  async created(): Promise<void> {
    await this.$nextTick();

    if (this.lists.length === 0) {
      this.createList({
        name: this.$t("general.defaultListName") as string,
        content: [],
      });
    }
  }

  @Watch("noOverflow", { immediate: true })
  setOverflowAllowed(noOverflow: boolean): void {
    document.body.classList.toggle("no-overflow", noOverflow);
  }

  @Watch("relaxed")
  onRelaxedChanged(relaxed: boolean): void {
    document.body.classList.toggle("relaxed", relaxed);
  }

  @Watch("fellAsleep")
  async handleFallenAsleep(fellAsleep: boolean): Promise<void> {
    if (fellAsleep) {
      const minutes = this.settings.sleepTimeout;
      const locale = await this.determineDateFnsLocale(this.$i18n.locale);

      let formattedDuration = formatDuration({ minutes }, { locale });
      formattedDuration = formattedDuration.charAt(0).toUpperCase() + formattedDuration.slice(1);

      await this.showMessage({
        buttons: [this.$t("general.ok") as string],
        type: ModalType.INFO,
        title: this.$t("sleepTimer.name") as string,
        message: this.$t("sleepTimer.streamStopped", {
          timePassed: this.$tc("sleepTimer.timePassed", minutes, {
            n: formattedDuration,
          }),
        }) as string,
      });

      this.confirmSleepTimer();
    }
  }

  @Watch("fullscreen")
  handleFullscreenChanged(fullscreen: boolean): void {
    if (fullscreen) {
      this.navbarShown = false;

      if (this.dialog) {
        navigate(null);
      }

      document.documentElement.style.overflowY = "scroll";
      const scrollbarWidth = window.innerWidth - document.body.offsetWidth;
      this.scrollbarWidth = `calc(100% + ${scrollbarWidth}px)`;
      document.documentElement.style.overflowY = "";
    } else {
      this.navbarShown = true;
      this.scrollbarWidth = "";
    }

    this.setBackgroundColor();
  }

  @Watch("settings.theme")
  handleThemeChanged(): void {
    this.loadStyle();
  }

  @Watch("colorScheme")
  handleColorSchemeChanged(colorScheme: string): void {
    if (colorScheme === "auto") {
      this.darkSchemeQuery.addListener(this.applyColorScheme);
      this.applyColorScheme();
    } else {
      this.darkSchemeQuery.removeListener(this.applyColorScheme);
      this.setDarkMode(colorScheme === "dark");
      this.loadStyle();
    }
  }

  @Watch("language", { immediate: true })
  handleLanguageChanged(locale: string): void {
    if (locale === "auto") {
      locale = this.detectLocale();
    }

    this.$i18n.locale = locale;
    document.documentElement.lang = locale;
    this.unsetDateFnsLocale();
  }

  @Watch("relaxModeAllowed")
  onRelaxModeAllowedChanged(relaxModeAllowed: boolean): void {
    if (relaxModeAllowed) {
      this.addInputListeners(this.setRelaxTimer);
    } else {
      this.removeInputListeners(this.setRelaxTimer);
    }
  }

  detectLocale(): string {
    const preferredLocales = [
      ...new Set(
        [navigator.language, ...navigator.languages].map((language) => language.substring(0, 2))
      ),
    ];

    const detectedLocale = preferredLocales.find((locale) => {
      return Object.keys(this.$i18n.messages).includes(locale);
    });

    return detectedLocale ?? "en";
  }

  addInputListeners(listener: EventListener): void {
    this.inputEventTypes.forEach((type) => {
      window.addEventListener(type, listener);
    });
  }

  removeInputListeners(listener: EventListener): void {
    this.inputEventTypes.forEach((type) => {
      window.removeEventListener(type, listener);
    });
  }

  applyColorScheme(): void {
    this.setDarkMode(this.darkSchemeQuery.matches);
    this.loadStyle();
  }

  handleFullscreenScroll(): void {
    if (this.fullscreen) {
      this.navbarShown = this.app.scrollTop > 0;
    }
  }
}
</script>

<style>
@import url("@/assets/css/app.css");
</style>
