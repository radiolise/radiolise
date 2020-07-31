<template>
  <div
    id="app"
    ref="app"
    :class="{
      colorful,
      dialog,
      dragging,
      fixedPlayer,
      fullscreen,
      hasVideo,
      noTransitions: !transitions,
      noNavbar: !navbarShown,
    }"
    :style="{
      width: scrollbarWidth,
      background: backgroundColor,
    }"
    @scroll="handleFullscreenScroll()"
  >
    <template v-if="ready">
      <rad-page />
      <rad-relax-caption />
      <rad-dialog-layer />
      <rad-visualization />
    </template>
    <rad-startup v-else />
  </div>
</template>

<script lang="ts">
import { Component, Ref, Watch, Mixins } from "vue-property-decorator";
import { State, Getter, Action } from "vuex-class";

import ColorChanger from "./mixins/ColorChanger";
import Hotkeys from "./mixins/Hotkeys";
import LikeHelper from "./mixins/LikeHelper";

import RadDialogLayer from "./components/RadDialogLayer.vue";
import RadPage from "./components/RadPage.vue";
import RadRelaxCaption from "./components/RadRelaxCaption.vue";
import RadStartup from "./components/RadStartup.vue";
import RadVisualization from "./components/RadVisualization.vue";

@Component({
  components: {
    RadDialogLayer,
    RadPage,
    RadRelaxCaption,
    RadStartup,
    RadVisualization,
  },
})
export default class App extends Mixins(ColorChanger, Hotkeys, LikeHelper) {
  navbarShown = true;

  @Ref() readonly app!: HTMLDivElement;

  @State readonly playing!: boolean;
  @State readonly relaxed!: boolean;

  @Getter readonly colorScheme!: string | null;
  @Getter readonly dragging!: boolean;
  @Getter readonly fixedPlayer!: boolean;
  @Getter readonly fullscreen!: boolean;
  @Getter readonly hasVideo!: boolean;
  @Getter readonly ready!: boolean;
  @Getter readonly settings!: Settings;

  @Action loadStyle!: () => void;
  @Action setDarkMode!: (darkMode: boolean) => void;
  @Action setRelaxTimer!: () => void;

  get darkSchemeQuery(): MediaQueryList {
    return window.matchMedia("(prefers-color-scheme: dark)");
  }

  get dialog(): boolean {
    return this.$route.path !== "/";
  }

  get noOverflow(): boolean {
    return this.dialog || this.relaxed;
  }

  get relaxModeAllowed(): boolean {
    return this.settings.relax && this.playing && !this.hasVideo;
  }

  get scrollbarWidth(): string {
    if (this.fullscreen) {
      const scrollbarWidth = window.innerWidth - document.body.clientWidth;
      return `calc(100% + ${scrollbarWidth}px)`;
    }

    return "";
  }

  get transitions(): boolean {
    return this.settings.transitions;
  }

  @Watch("noOverflow", { immediate: true })
  setOverflowAllowed(noOverflow: boolean): void {
    if (noOverflow) {
      document.body.classList.add("noOverflow");
    } else {
      document.body.classList.remove("noOverflow");
    }
  }

  @Watch("relaxed")
  onRelaxedChanged(relaxed: boolean): void {
    if (relaxed) {
      document.body.classList.add("relaxed");
    } else {
      document.body.classList.remove("relaxed");
    }
  }

  @Watch("fullscreen")
  handleFullscreenChanged(fullscreen: boolean): void {
    if (fullscreen) {
      this.navbarShown = false;

      if (this.dialog) {
        this.$router.push("/");
      }
    } else {
      this.navbarShown = true;
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

  @Watch("relaxModeAllowed")
  onRelaxModeAllowedChanged(relaxModeAllowed: boolean): void {
    if (relaxModeAllowed) {
      this.addInputListeners(this.setRelaxTimer);
    } else {
      this.removeInputListeners(this.setRelaxTimer);
    }
  }

  addInputListeners(listener: EventListener): void {
    ["mousemove", "mousedown", "keydown", "touchstart"].forEach(type => {
      window.addEventListener(type, listener);
    });
  }

  removeInputListeners(listener: EventListener): void {
    ["mousemove", "mousedown", "keydown", "touchstart"].forEach(type => {
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
