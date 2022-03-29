<template>
  <div id="page">
    <nav>
      <div class="navbar-content">
        <RadLink v-slot="{ navigate }" to="menu" toggle>
          <span @click="navigate">
            <RadLogo /><span>{{ appTitle }}</span>
          </span>
        </RadLink>
        <div>
          <RadLink v-slot="{ active, navigate }" to="search" toggle>
            <RadMenuButton
              :aria-label="$t('general.findStations')"
              :active="active"
              @click="navigate"
            >
              <FasSearch /><span :class="['hidden md:inline', { 'lg:hidden xl:inline': dialog }]">
                {{ $t("general.findStations") }}</span
              >
            </RadMenuButton>
          </RadLink>
          <RadLink v-slot="{ active, navigate }" to="settings" toggle>
            <RadMenuButton :aria-label="$t('general.settings')" :active="active" @click="navigate">
              <FasCog /><span :class="['hidden md:inline', { 'lg:hidden xl:inline': dialog }]">
                {{ $t("general.settings") }}</span
              >
            </RadMenuButton>
          </RadLink>
          <RadLink v-slot="{ active, navigate }" to="menu" toggle>
            <RadMenuButton :aria-label="$t('general.more')" :active="active" @click="navigate">
              <FasBars /><span :class="['hidden md:inline', { 'lg:hidden xl:inline': dialog }]">
                {{ $t("general.more") }}</span
              >
            </RadMenuButton>
          </RadLink>
        </div>
        <RadPlayer />
      </div>
    </nav>
    <main>
      <div>
        <RadPlayer>
          <RadMedia />
        </RadPlayer>
        <div id="main-controls">
          <div class="text-left" style="padding-top: 40px">
            <RadListMenu />
            <RadEmptyList v-if="listEmpty" />
            <RadStationList v-else />
          </div>
          <p v-if="!listEmpty" class="my-4 py-5 text-right">
            <RadLink v-slot="{ active, navigate }" to="search" toggle>
              <RadButton :active="active" @click="navigate">
                <FasSearch class="w-fixed" />{{ $t("general.findStations") }}
              </RadButton>
            </RadLink>
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Mixins } from "vue-property-decorator";
import { State, Getter, Action } from "vuex-class";

import RadButton from "./RadButton.vue";
import RadEmptyList from "./RadEmptyList.vue";
import RadLink from "./RadLink.vue";
import RadListMenu from "./RadListMenu.vue";
import RadLogo from "./RadLogo.vue";
import RadMedia from "./RadMedia.vue";
import RadMenuButton from "./RadMenuButton.vue";
import RadPlayer from "./RadPlayer.vue";
import RadStationList from "./RadStationList.vue";

import ScrollHelper from "@/mixins/ScrollHelper";

@Component({
  components: {
    RadButton,
    RadEmptyList,
    RadLink,
    RadListMenu,
    RadLogo,
    RadMedia,
    RadMenuButton,
    RadPlayer,
    RadStationList,
    FasSearch,
    FasCog,
    FasBars,
  },
})
export default class RadPage extends Mixins(ScrollHelper) {
  appTitle = process.env.VUE_APP_TITLE;
  provideMediaSession = false;

  @State readonly currentDialog!: DialogState | null;

  @Getter readonly currentStation: Station | undefined;
  @Getter readonly currentList!: Station[];

  @Action playClosestStation!: (forward: boolean) => Promise<void>;

  @Watch("currentList")
  handleListChanged(): void {
    this.setSwitchButtons();
  }

  @Watch("currentStation", { immediate: true })
  handleStationChanged(station?: Station, oldStation?: Station): void {
    const titlePrefix = station !== undefined ? `${station.name} - ` : "";
    document.title = titlePrefix + this.appTitle;

    if (station === undefined || oldStation === undefined) {
      this.setSwitchButtons();
    }
  }

  get dialog() {
    return this.currentDialog !== null;
  }

  get listEmpty(): boolean {
    return this.currentList.length === 0;
  }

  setSwitchButtons(): void {
    const { mediaSession } = navigator;

    if (mediaSession === undefined) {
      return;
    }

    const { currentStation } = this;

    const provideHandlers =
      currentStation !== undefined &&
      this.currentList.length >= 2 &&
      this.currentList.some((station) => station.id === currentStation.id);

    if (this.provideMediaSession === provideHandlers) {
      return;
    }

    this.provideMediaSession = provideHandlers;

    mediaSession.setActionHandler(
      "previoustrack",
      provideHandlers
        ? () => {
            this.playClosestStation(false);
          }
        : null
    );

    mediaSession.setActionHandler(
      "nexttrack",
      provideHandlers
        ? () => {
            this.playClosestStation(true);
          }
        : null
    );
  }
}
</script>
