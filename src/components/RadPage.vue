<template>
  <div id="page">
    <nav>
      <div>
        <rad-router-toggle v-slot="{ navigate }" to="/menu" custom>
          <span @click="navigate">
            <rad-logo /><span>{{ appTitle }}</span>
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
import RadLogo from "./RadLogo.vue";
import RadMedia from "./RadMedia.vue";
import RadPlayer from "./RadPlayer.vue";
import RadRouterToggle from "./RadRouterToggle.vue";
import RadStationList from "./RadStationList.vue";

@Component({
  components: {
    RadEmptyList,
    RadListMenu,
    RadLogo,
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
