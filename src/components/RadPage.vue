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
            <button :aria-label="$t('general.findStations')" :class="{ active }" @click="navigate">
              <FasSearch /><span> {{ $t("general.findStations") }}</span>
            </button>
          </RadLink>
          <RadLink v-slot="{ active, navigate }" to="settings" toggle>
            <button :aria-label="$t('general.settings')" :class="{ active }" @click="navigate">
              <FasCog /><span> {{ $t("general.settings") }}</span>
            </button>
          </RadLink>
          <RadLink v-slot="{ active, navigate }" to="menu" toggle>
            <button :aria-label="$t('general.more')" :class="{ active }" @click="navigate">
              <FasBars /><span> {{ $t("general.more") }}</span>
            </button>
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
          <p v-if="!listEmpty" class="text-right">
            <RadLink v-slot="{ active, navigate }" to="search" toggle>
              <a :class="['button', { active }]" @click="navigate">
                <FasSearch class="w-fixed" />{{ $t("general.findStations") }}
              </a>
            </RadLink>
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
    FasSearch,
    FasCog,
    FasBars,
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
    const titlePrefix = station !== undefined ? `${station.name} - ` : "";
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
