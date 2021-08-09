<template>
  <div id="page">
    <nav>
      <div>
        <rad-router-toggle v-slot="{ navigate }" to="/menu" custom>
          <span @click="navigate">
            <svg
              id="logo"
              width="30"
              height="30"
              preserveAspectRatio="xMidYMid"
              viewBox="0 0 512 512"
            >
              <g transform="matrix(1.3889 0 0 1.3889 -99.562 -99.556)">
                <path
                  d="m130.22 128c139.4 0 253.78 114.4 253.78 252.84 0 0.985-0.062 1.969-0.078 2.969h-47.579c0.016-1 0.078-1.984 0.078-2.969 0-112.4-93.045-205.58-206.2-205.58-0.649 0-1.316 0.056-1.968 0.056v-47.259c0.652 0 1.319-0.054 1.968-0.054z"
                />
                <path
                  d="m164.19 384c-19.979 0-36.187-16.066-36.187-35.934 0-19.845 16.208-35.943 36.187-35.943 20 0 36.185 16.098 36.185 35.943 0 19.868-16.185 35.934-36.185 35.934z"
                />
                <path
                  d="m248.28 383.8c0.023-1.015 0.148-1.968 0.148-2.969 0-65.156-52.613-117.65-118.21-117.65-0.649 0-1.316 0.086-1.968 0.094v-47.258c0.652-0.016 1.319-0.117 1.968-0.117 91.832 0 165.8 73.711 165.8 164.93 0 1.001-0.141 1.954-0.168 2.969z"
                />
              </g></svg
            ><span>{{ appTitle }}</span>
          </span>
        </rad-router-toggle>
        <div>
          <rad-router-toggle v-slot="{ navigate, active }" to="/search" custom>
            <button
              :aria-label="$t('general.findStations')"
              :class="{ active }"
              @click="navigate"
            >
              <font-awesome-icon icon="search" /><span>
                {{ $t("general.findStations") }}</span
              >
            </button>
          </rad-router-toggle>
          <rad-router-toggle
            v-slot="{ navigate, active }"
            to="/settings"
            custom
          >
            <button
              :aria-label="$t('general.settings')"
              :class="{ active }"
              @click="navigate"
            >
              <font-awesome-icon icon="cog" /><span>
                {{ $t("general.settings") }}</span
              >
            </button>
          </rad-router-toggle>
          <rad-router-toggle v-slot="{ navigate, active }" to="/menu" custom>
            <button
              :aria-label="$t('general.more')"
              :class="{ active }"
              @click="navigate"
            >
              <font-awesome-icon icon="bars" /><span>
                {{ $t("general.more") }}</span
              >
            </button>
          </rad-router-toggle>
        </div>
        <rad-player />
      </div>
    </nav>
    <main>
      <div>
        <rad-player>
          <rad-media />
        </rad-player>
        <div id="main-controls">
          <div style="text-align: left; padding-top: 40px">
            <rad-list-menu />
            <rad-empty-list v-if="listEmpty" />
            <rad-station-list v-else />
          </div>
          <p v-if="!listEmpty" class="text-right">
            <rad-router-toggle class="button" to="/search">
              <font-awesome-icon icon="search" fixed-width />{{
                $t("general.findStations")
              }}
            </rad-router-toggle>
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Mixins } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";

import ScrollHelper from "@/mixins/ScrollHelper";
import RadEmptyList from "./RadEmptyList.vue";
import RadListMenu from "./RadListMenu.vue";
import RadMedia from "./RadMedia.vue";
import RadPlayer from "./RadPlayer.vue";
import RadRouterToggle from "./RadRouterToggle.vue";
import RadStationList from "./RadStationList.vue";

@Component({
  components: {
    RadEmptyList,
    RadListMenu,
    RadMedia,
    RadPlayer,
    RadRouterToggle,
    RadStationList,
  },
})
export default class RadPage extends Mixins(ScrollHelper) {
  appTitle = process.env.VUE_APP_TITLE;
  provideMediaSession = false;

  @Getter readonly currentStation: Station | undefined;
  @Getter readonly currentList!: Station[];

  @Action playClosestStation!: (forward: boolean) => Promise<void>;

  @Watch("currentList")
  handleListChanged(): void {
    this.setSwitchButtons();
  }

  @Watch("currentStation", { immediate: true })
  handleStationChanged(station?: Station, oldStation?: Station): void {
    const titlePrefix = station !== undefined ? station.name + " - " : "";
    document.title = titlePrefix + this.appTitle;

    if (station === undefined || oldStation === undefined) {
      this.setSwitchButtons();
    }
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

<style scoped>
#logo path {
  fill: currentColor;
}
</style>
