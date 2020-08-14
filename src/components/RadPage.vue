<template>
  <div id="page">
    <nav>
      <div>
        <rad-router-toggle to="/menu" tag="span">
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
          ><span>{{ appName }}</span>
        </rad-router-toggle>
        <div>
          <rad-router-toggle
            tag="button"
            :aria-label="$t('general.findStations')"
            to="/search"
          >
            <font-awesome-icon icon="search" /><span>
              {{ $t("general.findStations") }}</span
            >
          </rad-router-toggle>
          <rad-router-toggle
            tag="button"
            :aria-label="$t('general.settings')"
            to="/settings"
          >
            <font-awesome-icon icon="cog" /><span>
              {{ $t("general.settings") }}</span
            >
          </rad-router-toggle>
          <rad-router-toggle
            tag="button"
            :aria-label="$t('general.more')"
            to="/menu"
          >
            <font-awesome-icon icon="bars" /><span>
              {{ $t("general.more") }}</span
            >
          </rad-router-toggle>
        </div>
        <rad-player />
      </div>
    </nav>
    <main>
      <div>
        <rad-player>
          <rad-video />
        </rad-player>
        <div id="maincontrols">
          <div style="text-align: left; padding-top: 40px">
            <rad-list-menu />
            <div v-if="currentList.length === 0">
              {{ $t("general.listEmpty[0]") }}<br />{{
                $t("general.listEmpty[1]")
              }}
            </div>
            <rad-station-list />
          </div>
          <p class="text-right">
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
import RadListMenu from "./RadListMenu.vue";
import RadPlayer from "./RadPlayer.vue";
import RadRouterToggle from "./RadRouterToggle.vue";
import RadStationList from "./RadStationList.vue";
import RadVideo from "./RadVideo.vue";

@Component({
  components: {
    RadListMenu,
    RadPlayer,
    RadRouterToggle,
    RadStationList,
    RadVideo,
  },
})
export default class RadPage extends Mixins(ScrollHelper) {
  provideMediaSession = false;

  @Getter readonly appName!: string;
  @Getter readonly currentStation?: Station;
  @Getter readonly currentList!: Station[];

  @Action playClosestStation!: (forward: boolean) => Promise<void>;

  @Watch("currentList")
  handleListChanged(): void {
    this.setSwitchButtons();
  }

  @Watch("currentStation", { immediate: true })
  handleStationChanged(station?: Station, oldStation?: Station): void {
    const titlePrefix = station !== undefined ? station.name + " - " : "";
    document.title = titlePrefix + this.appName;

    if (station === undefined || oldStation === undefined) {
      this.setSwitchButtons();
    }
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
      this.currentList.some(station => station.id === currentStation.id);

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

<style lang="less" scoped>
#logo path {
  fill: currentColor;
}
</style>
