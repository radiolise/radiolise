<template>
  <div id="page">
    <nav>
      <div>
        <rad-link v-slot="{ navigate }" to="menu" toggle>
          <span @click="navigate">
            <rad-logo /><span>{{ appTitle }}</span>
          </span>
        </rad-link>
        <div>
          <rad-link v-slot="{ active, navigate }" to="search" toggle>
            <button
              :aria-label="$t('general.findStations')"
              :class="{ active }"
              @click="navigate"
            >
              <font-awesome-icon icon="search" /><span>
                {{ $t("general.findStations") }}</span
              >
            </button>
          </rad-link>
          <rad-link v-slot="{ active, navigate }" to="settings" toggle>
            <button
              :aria-label="$t('general.settings')"
              :class="{ active }"
              @click="navigate"
            >
              <font-awesome-icon icon="cog" /><span>
                {{ $t("general.settings") }}</span
              >
            </button>
          </rad-link>
          <rad-link v-slot="{ active, navigate }" to="menu" toggle>
            <button
              :aria-label="$t('general.more')"
              :class="{ active }"
              @click="navigate"
            >
              <font-awesome-icon icon="bars" /><span>
                {{ $t("general.more") }}</span
              >
            </button>
          </rad-link>
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
            <rad-link v-slot="{ active, navigate }" to="search" toggle>
              <a :class="['button', { active }]" @click="navigate">
                <font-awesome-icon icon="search" fixed-width />{{
                  $t("general.findStations")
                }}
              </a>
            </rad-link>
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
import RadLink from "./RadLink.vue";
import RadListMenu from "./RadListMenu.vue";
import RadLogo from "./RadLogo.vue";
import RadMedia from "./RadMedia.vue";
import RadPlayer from "./RadPlayer.vue";
import RadStationList from "./RadStationList.vue";

@Component({
  components: {
    RadEmptyList,
    RadLink,
    RadListMenu,
    RadLogo,
    RadMedia,
    RadPlayer,
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
